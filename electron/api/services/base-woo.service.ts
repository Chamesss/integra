import { WOO_CONFIG } from "../../config";
import axios, { AxiosInstance } from "axios";

export interface WooConfig {
  baseURL: string;
  consumerKey: string;
  consumerSecret: string;
  username: string; // WP username for media uploads
  password: string; // WP application password
}

export interface BatchDeleteRequest {
  delete: { id: number }[];
}

export abstract class BaseWooService {
  protected api: AxiosInstance;

  private readonly config: WooConfig = {
    baseURL: WOO_CONFIG.baseURL,
    consumerKey: WOO_CONFIG.consumerKey,
    consumerSecret: WOO_CONFIG.consumerSecret,
    username: WOO_CONFIG.username,
    password: WOO_CONFIG.password,
  };

  constructor() {
    this.api = this.createApiInstance();
  }

  private createApiInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: 20000,
    });

    // Request interceptor: apply correct auth per endpoint
    instance.interceptors.request.use((req) => {
      if (!req.url) return req;

      // WooCommerce endpoints (wc/v3) -> OAuth1 via query params
      if (req.url.startsWith("/wp-json/wc/")) {
        req.params = {
          ...(req.params || {}),
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret,
        };
        // Remove Basic Auth if set
        delete req.auth;
      }
      // WordPress core endpoints (wp/v2) -> Basic Auth via Application Password
      else if (req.url.startsWith("/wp-json/wp/v2/")) {
        req.auth = {
          username: this.config.username,
          password: this.config.password,
        };
        // Remove WooCommerce params if present
        if (req.params) {
          delete (req.params as any).consumer_key;
          delete (req.params as any).consumer_secret;
        }
      }

      return req;
    });

    return instance;
  }

  protected createBatchDeletePayload(ids: number[]): BatchDeleteRequest {
    return { delete: ids.map((id) => ({ id })) };
  }
}
