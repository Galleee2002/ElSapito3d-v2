export const ADMIN_EMAILS: string[] = import.meta.env.VITE_ADMIN_EMAIL
  ? import.meta.env.VITE_ADMIN_EMAIL.split(",").map((email: string) =>
      email.trim().toLowerCase()
    )
  : ["liamjarazucchi@gmail.com"];
