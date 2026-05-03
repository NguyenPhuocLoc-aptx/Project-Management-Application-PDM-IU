import { useState } from "react";
import { Outlet } from "react-router-dom";
import { createContext, useContext } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import NewProjectModal from "../modals/NewProjectModal";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { useProjects } from "../../hooks/useProjects";

export const LayoutContext = createContext({ openNewProject: () => { } });
export const useLayout = () => useContext(LayoutContext);

export default function AppLayout() {
    const [projModalOpen, setProjModalOpen] = useState(false);
    const { workspaces } = useWorkspaces();
    const { addProject } = useProjects();

    const openNewProject = () => setProjModalOpen(true);
    const closeNewProject = () => setProjModalOpen(false);

    return (
        <LayoutContext.Provider value={{ openNewProject, closeNewProject }}>
            <div className="min-h-screen bg-background font-body text-on-surface flex">
                <Sidebar onNewProject={openNewProject} />

                <div className="ml-64 flex-1 flex flex-col min-h-screen">
                    <TopHeader />
                    <main className="flex-1 p-6 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Global new-project modal — available from Sidebar CTA */}
            <NewProjectModal
                open={projModalOpen}
                onClose={closeNewProject}
                onCreated={addProject}
                workspaces={workspaces}
                defaultWorkspaceId={workspaces[0]?.id || ""}
            />
        </LayoutContext.Provider>
    );
}