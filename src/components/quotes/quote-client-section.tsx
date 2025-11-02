import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Users,
  ChevronDown,
  User,
  Phone,
  MapPin,
  Hash,
  Mail,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Client } from "@electron/models/client";
import { Input } from "../ui/input";
import { useState, useRef, useEffect } from "react";
import useFetchAll from "@/hooks/useFetchAll";
import ClientsMenuLoading from "../ui/misc/clients-menu-loading";
import ClientIcon from "@/components/ui/client-icon";

interface QuoteClientSectionProps {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
}

export default function QuoteClientSection({
  selectedClient,
  setSelectedClient,
}: QuoteClientSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKey, setSearchKey] = useState<"name" | "tva">("name");
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchOptionsRef = useRef<HTMLDivElement>(null);

  const {
    data: clients,
    setSearchQuery,
    searchQuery,
    isLoading,
  } = useFetchAll<Client>({
    method: "client:getAll",
    search_key: searchKey,
    fetcherLimit: 1000,
    uniqueKey: "quote-client-selection",
  });

  const filteredClients = clients?.rows || [];

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        searchOptionsRef.current &&
        !searchOptionsRef.current.contains(event.target as Node)
      ) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSearchKeyChange = (key: "name" | "tva") => {
    setSearchKey(key);
    setShowSearchOptions(false);
    setIsOpen(false); // Close main dropdown when switching search type
    setSearchQuery(""); // Clear search when switching
  };

  const handleFilterButtonClick = () => {
    setShowSearchOptions(!showSearchOptions);
    setIsOpen(false); // Close main dropdown when opening filter options
  };

  const getSearchPlaceholder = () => {
    return searchKey === "name"
      ? "Rechercher par nom..."
      : "Rechercher par code TVA...";
  };

  const getSearchKeyLabel = () => {
    return searchKey === "name" ? "Nom" : "TVA";
  };

  return (
    <Card className="h-fit xl:w-[25rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedClient ? (
          <div className="space-y-6">
            {/* Header with change client button */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <ClientIcon type={selectedClient.type} size="md" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedClient.name}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {selectedClient.type === "individual"
                      ? "Particulier"
                      : "Établissement"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClient(null)}
                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4" />
                Changer
              </Button>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 gap-4">
              {/* TVA Code */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Hash className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Code TVA
                  </div>
                  <div className="font-medium text-gray-900">
                    {selectedClient.tva || "N/A"}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Informations de contact
                </div>
                <div className="space-y-2 ml-6">
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {selectedClient.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse de livraison
                </div>
                <div className="ml-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {selectedClient.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            {/* Search Input with Search Key Dropdown */}
            <div className="flex gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onClick={handleInputClick}
                  className="pl-10 text-[0.8rem]! pr-10 h-12 border-2 border-gray-200 focus:border-primary/20 rounded-lg transition-colors"
                />
                <ChevronDown
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {/* Search Key Selector */}
              <div className="relative" ref={searchOptionsRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFilterButtonClick}
                  className="h-12 px-2 w-fit focus:border-primary/20 active:border-primary/20"
                >
                  <Filter className="w-3 h-3" />
                  <span className="ml-0.5 mt-1 text-xs">
                    {getSearchKeyLabel()}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 ml-0.5 transition-transform ${
                      showSearchOptions ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {showSearchOptions && (
                  <div className="absolute top-full left-0 z-50 bg-white border-2 border-gray-200 rounded-lg shadow-lg mt-1 min-w-[120px]">
                    {[
                      { key: "name", label: "Nom", icon: User },
                      { key: "tva", label: "TVA", icon: Hash },
                    ].map(({ key, label, icon: Icon }, index) => (
                      <div
                        key={key}
                        onClick={() =>
                          handleSearchKeyChange(key as "name" | "tva")
                        }
                        className={`px-3 py-2 cursor-pointer hover:bg-primary/10 flex items-center gap-2 ${
                          searchKey === key
                            ? "bg-primary/5 text-primary-600"
                            : ""
                        } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                      >
                        <Icon className="w-4 h-4 inline-block mr-2" />
                        <span className="text-xs">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xs mt-2 max-h-[320px] overflow-hidden">
                <div className="max-h-[320px] overflow-y-auto">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <ClientsMenuLoading key={index} />
                    ))
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className={`flex items-center gap-4 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                          index !== filteredClients.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <ClientIcon
                          type={client.type}
                          size="sm"
                          className="flex-shrink-0 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium mb-0.5 text-sm text-gray-900 truncate">
                            {client.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">
                              {client.type === "individual"
                                ? "Particulier"
                                : "Établissement"}
                            </span>
                            {searchKey === "name" && client.tva && (
                              <>
                                <span>•</span>
                                <span className="font-mono">
                                  TVA: {client.tva}
                                </span>
                              </>
                            )}
                            {searchKey === "tva" && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-blue-600">
                                  {client.tva}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                      <div className="text-gray-500 font-medium">
                        Aucun client trouvé
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Essayez un autre terme de recherche
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
