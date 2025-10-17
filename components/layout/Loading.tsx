export default function Loading() {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex items-center bg-white dark:bg-gray-800 px-12 py-1 rounded-lg shadow-lg">
              <p className="text-lg">Loading file...</p>
              <svg width="60" height="60" viewBox="0 0 50 50"><g fill="none" stroke="#60A5FA" stroke-width="2"><path d="M15 10h15l5 5v20H15V10"><animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite"></animate></path><path d="M30 10v5h5"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"></animate></path><path d="M20 20h10M20 25h10M20 30h10"><animate attributeName="stroke-dasharray" values="0,60;60,0" dur="2s" repeatCount="indefinite"></animate></path></g></svg>
            </div>
        </div>
    )
}