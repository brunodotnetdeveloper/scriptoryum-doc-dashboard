import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CompanySelectorProps {
  className?: string;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({ className }) => {
  const { currentCompany, userCompanies, switchCompany } = useAuth();

  if (!userCompanies.length) {
    return null;
  }

  const handleCompanyChange = (companyId: string) => {
    switchCompany(parseInt(companyId));
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentCompany?.id?.toString() || ''}
        onValueChange={handleCompanyChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecionar empresa" />
        </SelectTrigger>
        <SelectContent>
          {userCompanies.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              <div className="flex items-center space-x-2">
                <span>{company.name}</span>
                {company.status === 'Inactive' && (
                  <span className="text-xs text-muted-foreground">(Inativa)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelector;