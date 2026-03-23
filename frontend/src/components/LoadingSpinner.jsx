export default function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
}
