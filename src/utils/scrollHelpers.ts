export const scrollToTop = (behavior: ScrollBehavior = "instant") => {
  window.scrollTo({ top: 0, behavior });
};

export const scrollToSection = (id: string, behavior: ScrollBehavior = "smooth") => {
  document.getElementById(id)?.scrollIntoView({ behavior });
};

