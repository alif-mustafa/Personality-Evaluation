'use client';

import { useState, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { generateConflictReport } from '@/lib/conflictEngine';

// Default values to match the spec's example
const defaultPartnerA = {
  loveLanguage:  { primary: 'words', secondary: 'time' },
  bigFive:       { openness: 3.8, conscientiousness: 4.2, extraversion: 2.5, agreeableness: 4.0, neuroticism: 4.5 },
  attachment:    { anxietyScore: 5.8, avoidanceScore: 2.1 }
};

const defaultPartnerB = {
  loveLanguage:  { primary: 'touch', secondary: 'acts' },
  bigFive:       { openness: 4.2, conscientiousness: 2.8, extraversion: 4.0, agreeableness: 2.5, neuroticism: 2.0 },
  attachment:    { anxietyScore: 2.0, avoidanceScore: 5.2 }
};

// Form options
const loveLanguageOptions = ['words', 'acts', 'gifts', 'time', 'touch'];
const conflictStyleOptions = ['Validating', 'Volatile', 'Conflict-Avoiding', 'Hostile', 'Hostile-Detached'];

export default function PlaygroundPage() {
  // Security check: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const [partnerA, setPartnerA] = useState(defaultPartnerA);
  const [partnerB, setPartnerB] = useState(defaultPartnerB);
  const [coupleStyle, setCoupleStyle] = useState('Volatile');

  const report = useMemo(() => {
    try {
      return generateConflictReport(partnerA, partnerB, { coupleConflictStyle: coupleStyle });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [partnerA, partnerB, coupleStyle]);

  const updatePartner = (setter, category, field, value) => {
    setter(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderPartnerControls = (title, partner, setter) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
      <h2 className="text-xl font-semibold mb-6 text-indigo-900 border-b pb-2">{title}</h2>
      
      {/* Love Language */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Love Language</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Primary</label>
            <select 
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              value={partner.loveLanguage.primary}
              onChange={(e) => updatePartner(setter, 'loveLanguage', 'primary', e.target.value)}
            >
              {loveLanguageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Secondary</label>
            <select 
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              value={partner.loveLanguage.secondary}
              onChange={(e) => updatePartner(setter, 'loveLanguage', 'secondary', e.target.value)}
            >
              {loveLanguageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Attachment */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Attachment (1-7)</h3>
        <div className="space-y-3">
          <div>
            <label className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Anxiety</span>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 rounded">{partner.attachment.anxietyScore.toFixed(1)}</span>
            </label>
            <input 
              type="range" min="1" max="7" step="0.1" 
              className="w-full accent-indigo-600"
              value={partner.attachment.anxietyScore}
              onChange={(e) => updatePartner(setter, 'attachment', 'anxietyScore', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Avoidance</span>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 rounded">{partner.attachment.avoidanceScore.toFixed(1)}</span>
            </label>
            <input 
              type="range" min="1" max="7" step="0.1" 
              className="w-full accent-indigo-600"
              value={partner.attachment.avoidanceScore}
              onChange={(e) => updatePartner(setter, 'attachment', 'avoidanceScore', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Big Five */}
      <div>
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 tracking-wider">Big Five (1-5)</h3>
        <div className="space-y-4">
          {Object.keys(partner.bigFive).map(trait => (
            <div key={trait}>
              <label className="flex justify-between text-sm text-gray-700 mb-1">
                <span className="capitalize">{trait}</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 rounded">{partner.bigFive[trait].toFixed(1)}</span>
              </label>
              <input 
                type="range" min="1" max="5" step="0.1" 
                className="w-full accent-indigo-600"
                value={partner.bigFive[trait]}
                onChange={(e) => updatePartner(setter, 'bigFive', trait, parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Conflict Engine Playground</h1>
          <p className="text-gray-500">Test the generateConflictReport logic instantly. This page is only accessible in development.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Inputs */}
          <div className="flex flex-col gap-6 lg:w-2/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-900 border-b pb-2">Couple Conflict Style</h2>
              <div className="w-full md:w-1/2">
                <label className="block text-sm text-gray-700 mb-1">Shared Dynamic</label>
                <select 
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                  value={coupleStyle}
                  onChange={(e) => setCoupleStyle(e.target.value)}
                >
                  {conflictStyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {renderPartnerControls('Partner A', partnerA, setPartnerA)}
              {renderPartnerControls('Partner B', partnerB, setPartnerB)}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-10">
              <h2 className="text-xl font-semibold mb-6 text-indigo-900 border-b pb-2">Generated Report</h2>
              
              {report ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="bg-indigo-50 p-5 rounded-xl flex items-center justify-between border border-indigo-100">
                    <div>
                      <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Total Score</p>
                      <p className={`text-5xl font-extrabold mt-1 tracking-tight ${
                        report.score >= 70 ? 'text-red-600' :
                        report.score >= 45 ? 'text-orange-500' :
                        report.score >= 20 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {report.score} <span className="text-xl font-medium text-gray-400">/ 100</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm ${
                        report.label === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                        report.label === 'Moderate' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        report.label === 'Low' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {report.label}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div>
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Clash Breakdown</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
                        <span className="text-gray-700 font-medium">Attachment (35%)</span>
                        <div className="text-right">
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">{report.clashes.attachment.score}</span>
                          <span className="text-xs text-gray-500 mt-1 block">{report.clashes.attachment.styleA} vs {report.clashes.attachment.styleB}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
                        <span className="text-gray-700 font-medium">Big Five (30%)</span>
                        <div className="text-right">
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">{report.clashes.bigFive.score}</span>
                          <span className="text-xs text-gray-500 mt-1 block">Primary: {report.clashes.bigFive.primaryTrait}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
                        <span className="text-gray-700 font-medium">Conflict Style (25%)</span>
                        <div className="text-right">
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">{report.clashes.conflictStyle.score}</span>
                          <span className="text-xs text-gray-500 mt-1 block">{report.clashes.conflictStyle.coupleStyle}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">Love Language (10%)</span>
                        <div className="text-right">
                          <span className="font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded">{report.clashes.loveLanguage.score}</span>
                          <span className="text-xs text-gray-500 mt-1 block">{report.clashes.loveLanguage.langA} vs {report.clashes.loveLanguage.langB}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Narrative Output</h3>
                    
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-4 border-b border-indigo-200"></span>
                          What is really happening
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">{report.narrative.whatIsHappening}</p>
                      </div>

                      {report.narrative.whyItKeepsHappening && (
                        <div>
                          <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-4 border-b border-indigo-200"></span>
                            Why it keeps happening
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">{report.narrative.whyItKeepsHappening}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-4 border-b border-emerald-200"></span>
                          Where your strength is
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed bg-emerald-50 p-4 rounded-lg shadow-sm border border-emerald-100">{report.narrative.whereYourStrengthIs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                  <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p>Error generating report.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
