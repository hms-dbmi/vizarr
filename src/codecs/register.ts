import { registry } from "zarrita";
registry.set("jpeg2k", () => import("./jpeg2k").then((m) => m.default));
