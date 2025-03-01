import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, ChevronDown } from "./icons";
import { Button } from "./Button"; // Updated import

// Generic type for items that can be nested
export interface NestedItem {
  [key: string]: any;
  children?: NestedItem[];
}

// Improved navigation path with additional context
interface NavigationItem {
  id: string | number;
  label: string;
  parentId: string | number | null;
}

interface NestedSelectProps<T extends NestedItem> {
  // Core props
  items: T[];
  selectedItemId?: string | number | null;
  onSelect: (item: T, path: NavigationItem[]) => void;

  // Configuration props
  idKey?: string;
  labelKey?: string;
  childrenKey?: string;
  placeholder?: string;

  // Styling and behavior props
  maxHeight?: string | number;
  className?: string;
  dropdownClassName?: string;
  showSelectAll?: boolean;
  showBreadcrumb?: boolean;

  // Custom renderers
  renderItem?: (
    item: T,
    isSelected: boolean,
    hasChildren: boolean
  ) => React.ReactNode;
  renderTrigger?: (
    selectedItem: T | null,
    placeholder: string
  ) => React.ReactNode;
  renderBreadcrumb?: (path: NavigationItem[]) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;

  // Item filtering and state
  disableItem?: (item: T) => boolean;
  filterItems?: (items: T[], searchQuery: string) => T[];
  searchPlaceholder?: string;
}

/**
 * An enhanced nested select component for navigating and selecting from hierarchical data.
 */
export function NestedSelect<T extends NestedItem>({
  // Core props
  items,
  selectedItemId = null,
  onSelect,

  // Configuration
  idKey = "id",
  labelKey = "name",
  childrenKey = "children",
  placeholder = "Select an item...",

  // Styling and behavior
  maxHeight = "15rem",
  className = "",
  dropdownClassName = "",
  showSelectAll = true,
  showBreadcrumb = true,

  // Custom renderers
  renderItem,
  renderTrigger,
  renderBreadcrumb,
  renderEmpty,

  // Item filtering and state
  disableItem,
  filterItems,
  searchPlaceholder = "Search...",
}: NestedSelectProps<T>) {
  // Refs and state
  const componentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState<NavigationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Get the ID of the current item we're navigating under
  const currentParentId = navigationPath.length
    ? navigationPath[navigationPath.length - 1].id
    : null;

  // Find selected item and keep track of it
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Update selected item when selectedItemId changes
  useEffect(() => {
    if (selectedItemId === null) {
      setSelectedItem(null);
      return;
    }

    // Helper function to find an item by id recursively
    const findItem = (items: T[], id: string | number): T | null => {
      for (const item of items) {
        if (item[idKey] == id) {
          return item;
        }
        if (item[childrenKey]?.length) {
          const found = findItem(item[childrenKey], id);
          if (found) return found;
        }
      }
      return null;
    };

    const found = findItem(items, selectedItemId);
    setSelectedItem(found);
  }, [selectedItemId, items, idKey, childrenKey]);

  // Get current menu based on navigation path
  const getCurrentItems = useCallback(() => {
    if (!currentParentId) {
      return items;
    }

    // Helper function to find children of an item by id
    const findChildren = (items: T[], id: string | number): T[] => {
      for (const item of items) {
        if (item[idKey] === id) {
          return item[childrenKey] || [];
        }
        if (item[childrenKey]?.length) {
          const found = findChildren(item[childrenKey], id);
          if (found.length) return found;
        }
      }
      return [];
    };

    return findChildren(items, currentParentId);
  }, [items, currentParentId, idKey, childrenKey]);

  // Filter current items if search is active
  const currentItems = useCallback(() => {
    let currentMenu = getCurrentItems();

    if (searchQuery && filterItems) {
      return filterItems(currentMenu, searchQuery);
    }

    return currentMenu;
  }, [getCurrentItems, searchQuery, filterItems]);

  // Handle item selection or navigation
  const handleItemClick = useCallback(
    (item: T) => {
      if (disableItem?.(item)) {
        return;
      }

      const hasChildren = item[childrenKey]?.length > 0;

      if (hasChildren) {
        // Navigate into this item
        setNavigationPath((prev) => [
          ...prev,
          {
            id: item[idKey],
            label: item[labelKey],
            parentId: currentParentId,
          },
        ]);

        // Focus search input if it exists
        if (isSearching) {
          searchRef.current?.focus();
        }
      } else {
        // Select this item
        onSelect(item, navigationPath);
        setSelectedItem(item);
        setIsOpen(false);
        setSearchQuery("");
        setIsSearching(false);
      }
    },
    [
      onSelect,
      idKey,
      labelKey,
      childrenKey,
      disableItem,
      currentParentId,
      isSearching,
      navigationPath,
    ]
  );

  // Navigate up one level
  const handleBack = useCallback(() => {
    setNavigationPath((prev) => prev.slice(0, -1));
    setSearchQuery("");
  }, []);

  // Reset navigation when dropdown is closed
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setNavigationPath([]);
    setSearchQuery("");
    setIsSearching(false);
  }, []);

  // Handle search toggle
  const toggleSearch = useCallback(() => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    } else {
      setSearchQuery("");
    }
  }, [isSearching]);

  // Select current menu item as a group
  const handleSelectAll = useCallback(() => {
    if (currentParentId) {
      const findItem = (items: T[], id: string | number): T | null => {
        for (const item of items) {
          if (item[idKey] === id) {
            return item;
          }
          if (item[childrenKey]?.length) {
            const found = findItem(item[childrenKey], id);
            if (found) return found;
          }
        }
        return null;
      };

      const currentItem = findItem(items, currentParentId);
      if (currentItem) {
        onSelect(currentItem, navigationPath);
        setSelectedItem(currentItem);
        setIsOpen(false);
        setSearchQuery("");
        setIsSearching(false);
      }
    }
  }, [currentParentId, items, idKey, childrenKey, onSelect, navigationPath]);

  // Default item renderer
  const defaultRenderItem = useCallback(
    (item: T, isSelected: boolean, hasChildren: boolean) => (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{item[labelKey]}</span>
        {hasChildren ? (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        ) : (
          isSelected && <Check className="h-4 w-4 text-blue-500" />
        )}
      </div>
    ),
    [labelKey]
  );

  // Default trigger renderer
  const defaultRenderTrigger = useCallback(
    (selected: T | null, placeholder: string) => (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">
          {selected ? selected[labelKey] : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
    ),
    [labelKey]
  );

  // Default breadcrumb renderer
  const defaultRenderBreadcrumb = useCallback(
    (path: NavigationItem[]) => (
      <div className="flex items-center text-xs text-gray-500 truncate overflow-hidden">
        {path.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />
            )}
            <span className="truncate">{item.label}</span>
          </React.Fragment>
        ))}
      </div>
    ),
    []
  );

  // Default empty renderer
  const defaultRenderEmpty = useCallback(
    () => (
      <div className="p-4 text-center text-sm text-gray-500">
        No items found
      </div>
    ),
    []
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose]);

  // Current items after filtering
  const displayItems = currentItems();
  const isEmpty = displayItems.length === 0;

  return (
    <div className={`relative ${className}`} ref={componentRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {renderTrigger
          ? renderTrigger(selectedItem, placeholder)
          : defaultRenderTrigger(selectedItem, placeholder)}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border ${dropdownClassName}`}
          role="listbox"
        >
          {/* Top navigation bar */}
          <div className="p-2 border-b flex items-center justify-between">
            {/* Back button */}
            {navigationPath.length > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Search toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="text-xs"
            >
              {isSearching ? "Hide Search" : "Search"}
            </Button>
          </div>

          {/* Search box */}
          {isSearching && (
            <div className="p-2 border-b">
              <input
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1 text-sm border rounded"
              />
            </div>
          )}

          {/* Breadcrumb navigation */}
          {showBreadcrumb && navigationPath.length > 0 && (
            <div className="px-3 py-2 border-b">
              {renderBreadcrumb
                ? renderBreadcrumb(navigationPath)
                : defaultRenderBreadcrumb(navigationPath)}

              {/* Select current level */}
              {showSelectAll && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="mt-1 text-xs w-full"
                >
                  Select this level
                </Button>
              )}
            </div>
          )}

          {/* Item list */}
          <div className="overflow-auto" style={{ maxHeight }}>
            {isEmpty
              ? renderEmpty
                ? renderEmpty()
                : defaultRenderEmpty()
              : displayItems.map((item: T) => {
                  const isSelected = selectedItem?.[idKey] === item[idKey];
                  const isDisabled = disableItem?.(item);
                  const hasChildren = Boolean(item[childrenKey]?.length);

                  return (
                    <button
                      type="button"
                      key={item[idKey]}
                      onClick={() => handleItemClick(item)}
                      disabled={isDisabled}
                      className={`w-full px-3 py-2 text-sm text-left ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                      aria-selected={isSelected}
                      role="option"
                    >
                      {renderItem
                        ? renderItem(item, isSelected, hasChildren)
                        : defaultRenderItem(item, isSelected, hasChildren)}
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}
