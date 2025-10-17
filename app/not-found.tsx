import Link from 'next/link';
import { TextButton } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label'

export default function NotFound() {
    return (
        <div className="absolute inset-0 flex flex-col gap-y-2 bg-secondary flex items-center justify-center">
            <Label variant='default' size='lg'>404 - Page Not Found</Label>
            <Label variant='default' size='lg'>Sorry, the page you are looking for does not exist.</Label>
            <TextButton variant='info' size='lg' className='shadow-lg'><Link href="/">Go back to Home</Link></TextButton>
        </div>
    );
}