import React from 'react';
import { DocumentTypeManagement } from '@/components/DocumentTypeManagement';

const DocumentTypesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <DocumentTypeManagement />
    </div>
  );
};

export default DocumentTypesPage;