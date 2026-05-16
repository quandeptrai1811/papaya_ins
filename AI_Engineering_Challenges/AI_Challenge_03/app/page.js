"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import EditorPanel from '@/components/EditorPanel';
import PreviewPanel from '@/components/PreviewPanel';

const INITIAL_TEMPLATES = {
  "01_claim_submitted": {
    name: "Claim Submitted",
    file: "/templates/01_claim_submitted.html",
    vars: {
      member_name: "John Doe",
      claim_type: "Outpatient",
      submitted_date: "October 15, 2024",
      claim_number: "CLM-00123"
    }
  },
  "02_documents_received": {
    name: "Documents Received",
    file: "/templates/02_documents_received.html",
    vars: {
      member_name: "John Doe",
      claim_number: "CLM-00123",
      document_count: "3",
      documents_list: "<li>Medical Certificate</li><li>Original Invoice</li><li>Prescription</li>"
    }
  },
  "03_under_review": {
    name: "Under Review",
    file: "/templates/03_under_review.html",
    vars: {
      member_name: "John Doe",
      claim_number: "CLM-00123",
      assessor_name: "Sarah Jenkins",
      estimated_days: "3-5"
    }
  },
  "04_approved": {
    name: "Claim Approved",
    file: "/templates/04_approved.html",
    vars: {
      member_name: "John Doe",
      claim_number: "CLM-00123",
      approved_amount: "15,000 THB",
      original_amount: "15,000 THB",
      payment_method: "Direct Bank Transfer"
    }
  },
  "05_rejected": {
    name: "Claim Rejected",
    file: "/templates/05_rejected.html",
    vars: {
      member_name: "John Doe",
      claim_number: "CLM-00123",
      rejection_reason: "The submitted treatment is specifically excluded under your current 'Basic Health' policy terms regarding pre-existing conditions.",
      appeal_deadline: "November 15, 2024"
    }
  },
  "06_payment_sent": {
    name: "Payment Sent",
    file: "/templates/06_payment_sent.html",
    vars: {
      member_name: "John Doe",
      claim_number: "CLM-00123",
      payment_amount: "15,000 THB",
      payment_date: "October 18, 2024",
      reference_number: "TRX-993847582"
    }
  }
};

export default function Home() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [currentId, setCurrentId] = useState("01_claim_submitted");
  const [rawHtmlCache, setRawHtmlCache] = useState({});

  useEffect(() => {
    if (!rawHtmlCache[currentId]) {
      fetch(templates[currentId].file)
        .then(res => res.text())
        .then(html => {
          setRawHtmlCache(prev => ({ ...prev, [currentId]: html }));
        })
        .catch(err => {
          console.error("Failed to load template:", err);
          setRawHtmlCache(prev => ({ 
            ...prev, 
            [currentId]: `<div style="padding:20px; color:red;">Error loading template file. Make sure templates are in the public/templates folder.</div>`
          }));
        });
    }
  }, [currentId, templates, rawHtmlCache]);

  const handleVarChange = (key, value) => {
    setTemplates(prev => ({
      ...prev,
      [currentId]: {
        ...prev[currentId],
        vars: {
          ...prev[currentId].vars,
          [key]: value
        }
      }
    }));
  };

  return (
    <div className="app-container">
      <Sidebar 
        templates={templates} 
        currentTemplateId={currentId} 
        onSelectTemplate={setCurrentId} 
      />
      <EditorPanel 
        vars={templates[currentId].vars} 
        onVarChange={handleVarChange} 
      />
      <PreviewPanel 
        htmlContent={rawHtmlCache[currentId] || ""} 
        vars={templates[currentId].vars} 
      />
    </div>
  );
}
