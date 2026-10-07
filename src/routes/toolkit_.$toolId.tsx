import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/toolkit_/$toolId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/project-core", search: { screen: "toolkit", tool: params.toolId } });
  },
});
