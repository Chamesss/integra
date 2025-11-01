import { useEffect, useMemo, useState } from "react";
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import useDebounce from "./useDebounce";
import { IResults } from "electron/types/core.types";
import useLogout from "./useLogout";

interface Props<T> {
  search_key?: string;
  method: string;
  fetcherLimit?: number;
  fetcherCurrentPage?: number;
  uniqueKey?: string;
  queryOptions?: Omit<UseQueryOptions<IResults<T>, Error>, "queryKey">;
  queryParams?: Record<string, unknown>;
  disableDefaultFilters?: boolean;
  asData?: boolean; // Optional prop to return data directly
}

export default function useFetchAll<T>({
  method,
  search_key,
  fetcherLimit = 8,
  fetcherCurrentPage = 1,
  uniqueKey,
  queryOptions,
  queryParams,
  disableDefaultFilters,
  asData,
}: Props<T>) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(fetcherCurrentPage);
  const [limit, setLimit] = useState<number>(fetcherLimit);
  const [sortKey, setSortKey] = useState<string>(
    queryParams && queryParams.sort_key
      ? (queryParams.sort_key as string)
      : "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<string>(search_key || "");
  const search = useDebounce(searchQuery);
  const { logout } = useLogout();

  // Deep-memoize queryParams to avoid recreating query keys each render when disableDefaultFilters is true
  const stableQueryParams = useMemo(
    () => queryParams,
    [JSON.stringify(queryParams ?? {})]
  );

  const params = useMemo(
    () => ({
      page: currentPage,
      search: search || undefined,
      search_key: searchType || search_key || undefined,
      limit: limit,
      sortKey: sortKey,
      sort: sortOrder,
      ...stableQueryParams,
    }),
    [
      currentPage,
      search,
      limit,
      searchType,
      search_key,
      sortKey,
      sortOrder,
      stableQueryParams,
    ]
  );

  const fetcher = (): Promise<IResults<T>> => {
    return new Promise((resolve) => {
      window.ipcRenderer
        .invoke(method, params)
        .then((result) => {
          if (result.success) {
            if (result.data && asData) {
              return resolve({
                success: true,
                rows: [result.data],
                count: 1,
                message: result.message,
              });
            }

            resolve({
              rows: result.rows,
              count: result.count,
              message: result.message,
              success: result.success,
            });
          } else throw new Error(result);
        })
        .catch((error: unknown) => {
          console.log(error);
          const parseError =
            error instanceof Error ? error.message : String(error);
          if (
            ["AuthError", "Invalid token"].every((word) =>
              parseError.includes(word)
            )
          )
            logout();

          resolve({
            rows: [],
            count: 0,
            success: false,
            error: parseError,
          });
        });
    });
  };

  // Provide sensible caching defaults while allowing overrides
  const mergedQueryOptions: Partial<UseQueryOptions<IResults<T>, Error>> = {
    staleTime: 60 * 1000, // 1 min fresh window
    gcTime: 5 * 60 * 1000, // v5: time in ms garbage collected after unused
    refetchOnWindowFocus: false,
    ...queryOptions,
  };

  const effectiveKeyPart = disableDefaultFilters ? stableQueryParams : params;

  const queryInfo = useQuery<IResults<T>, Error>({
    queryKey: [method, effectiveKeyPart, uniqueKey],
    queryFn: fetcher,
    enabled: !!method,
    ...mergedQueryOptions,
  });

  const queryKey = [method, effectiveKeyPart, uniqueKey];

  const revalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKey,
    });

  const refetch = (opts?: { force?: boolean }) => {
    if (opts?.force) {
      queryClient.removeQueries({ queryKey });
    }
    return queryInfo.refetch();
  };

  useEffect(() => {
    if (queryInfo.data?.rows.length === 0 && currentPage > 1)
      setCurrentPage((prev) => prev - 1);
  }, [currentPage, queryInfo.data]);

  return {
    data: queryInfo.data,
    isLoading: queryInfo.isLoading, // true only for first load or force refetch without data
    isRefetching: queryInfo.isRefetching,
    isNativeFetching: queryInfo.isFetching,
    isNativeLoading: queryInfo.isLoading,
    showSkeleton: queryInfo.isLoading && !queryInfo.data,
    error: queryInfo.error,
    setCurrentPage,
    setLimit,
    currentPage,
    limit,
    params,
    revalidate,
    setSearchQuery,
    searchQuery,
    searchType,
    setSearchType,
    refetch,
    setSortKey,
    setSortOrder,
    sortOrder,
    sortKey,
  };
}
