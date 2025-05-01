import React from 'react';
import { Metadata } from 'next';
import CreateOrganizationForm from './create-organization-form';

export const metadata: Metadata = {
  title: 'Skapa ny förening',
  description: 'Skapa en ny bostadsrättsförening i systemet',
};

export default function CreateOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Skapa ny förening</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-700 mb-6">
          Fyll i uppgifterna nedan för att skapa en ny bostadsrättsförening. En digital handbok med standardmall kommer att skapas automatiskt.
        </p>
        
        <CreateOrganizationForm />
      </div>
    </div>
  );
} 