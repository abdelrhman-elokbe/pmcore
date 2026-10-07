import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/toolkit")({
  beforeLoad: () => {
    throw redirect({ to: "/project-core", search: { screen: "toolkit" } });
  },
});
