import { useEffect, useState } from "react";

const useSearch = (searchItem: string) => {
  const [search, setSearch] = useState(searchItem || "");

  useEffect(() => {
    const preventRequestOnEachKeystroke = setTimeout(() => {
      setSearch(searchItem?.trim());
    }, 1000);
    return () => {
      clearTimeout(preventRequestOnEachKeystroke);
    };
  }, [searchItem]);

  return search;
};

export default useSearch;
