import { useEffect } from "react";

import { createEffectWithTarget } from "global/hook";

const useEffectWithTarget = createEffectWithTarget(useEffect);

export default useEffectWithTarget;
