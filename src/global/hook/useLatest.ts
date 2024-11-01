import { useRef } from "react";

const useLatest = <T>(val: T) => {
	const ref = useRef(val);
	ref.current = val;
	return ref;
};

export default useLatest;
