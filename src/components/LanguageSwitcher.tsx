import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center justify-between space-x-2 bg-background p-3 rounded-lg border border-border">
            <div className="flex flex-col space-y-1">
                <span className="text-foreground font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-500" />
                    {t('common.language')}
                </span>
                <span className="font-normal text-xs text-muted-foreground">
                    Select your preferred language
                </span>
            </div>
            <Select value={i18n.language} onValueChange={changeLanguage}>
                <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="pl">Polski</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
