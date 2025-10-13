export default function Header() {
    return (
        <header className="bg-white dark:bg-tertiary border-b">
            <div className="flex items-center justify-between px-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stride</h1>
                <nav className="flex">
                    <button className="text-gray-600 dark:text-gray-300 px-2 hover:rounded-md hover:bg-secondary hover:text-gray-900 dark:hover:text-white">
                        File
                    </button>
                    <button className="text-gray-600 dark:text-gray-300 px-2 hover:rounded-md hover:bg-secondary hover:text-gray-900 dark:hover:text-white">
                        Documents
                    </button>
                    <button className="text-gray-600 dark:text-gray-300 px-2 hover:rounded-md hover:bg-secondary hover:text-gray-900 dark:hover:text-white">
                        Settings
                    </button>
                </nav>
            </div>
        </header>
    );
}