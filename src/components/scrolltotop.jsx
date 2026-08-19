import { useeffect } from "react";
import { uselocation } from "react-router-dom";

export default function scrolltotop() {
  const { pathname } = uselocation();
  useeffect(() => {
    window.scrollto(0, 0);
  }, [pathname]);
  return null;
}
