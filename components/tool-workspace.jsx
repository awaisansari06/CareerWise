import WorkspaceSidebar from "@/components/workspace-sidebar";
import PageMotion from "@/components/page-motion";

export default function ToolWorkspace({ activeHref, children }) {
  return (
    <div className="cw-dashboard-layout cw-design cw-tool-layout">
      <div className="cw-dashboard">
        <WorkspaceSidebar activeHref={activeHref} />
        <PageMotion className="cw-dashboard-main cw-tool-main">{children}</PageMotion>
      </div>
    </div>
  );
}
