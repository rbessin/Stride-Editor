import { TextButton } from "../ui/Button";

export default function Header() {
    return (
        <header className="bg-white dark:bg-tertiary border-b">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stride</h1>
                <nav className="flex gap-x-1 pb-0.5">
                    <TextButton onClick={(() => {})} variant="default" size="md" className="flex-1">File</TextButton>
                    <TextButton onClick={(() => {})} variant="default" size="md" className="flex-1">Documents</TextButton>
                    <TextButton onClick={(() => {})} variant="default" size="md" className="flex-1">Settings</TextButton>
                </nav>
            </div>
        </header>
    );
}