import { useState } from "react";
import Search from "../../../../Search/Search";
import SearchFilterBar from "../../../../SearchFilterBar/SearchFilterBar";

interface PopupSearchBarProps {
  toggled: { searchId: string[] };
  setToggled: Function;
}

export function PopupSearchBar({
  toggled,
  setToggled,
}: PopupSearchBarProps) {

  const [value, setValue] = useState<string>("");

  const searchMethod = (query: string) => {
    const delim = /\s*;\s*/;
    if (query && query.length > 0) {
      let valArr = query.replace(/\n/g, ";").split(delim);
      let uniqueValArr = [...new Set(valArr)];
      uniqueValArr = uniqueValArr.filter((value) => {
        return value !== '';
      });
      if (uniqueValArr && uniqueValArr.length > 0) {
        setToggled({ ...toggled, searchId: uniqueValArr });
      }
    } else {
      setToggled({ ...toggled, searchId: [] });
    }
  };

  return (
    <SearchFilterBar dashboard>
      <Search
        searchMethod={(query: string) => searchMethod(query)}
        searchOnChange={false}
        advancedSearch
        supportedFields="Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID and Manifest Name."
        value={value}
        setValue={setValue}
        placeholder={value ? "Click to view full query" : "Search"}
      />
    </SearchFilterBar>
  );
}