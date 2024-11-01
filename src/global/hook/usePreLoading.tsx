import { useEffect, useState } from "react";

const usePreLoading = (queryLoading: boolean) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryLoading) {
      setLoading(false);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [queryLoading]);

  return queryLoading || loading;
};

export default usePreLoading;
