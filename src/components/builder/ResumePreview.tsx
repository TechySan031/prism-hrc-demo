'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Monitor, Smartphone, Palette } from 'lucide-react';
import { Resume, TemplateSettings, TemplateId } from '@/types/resume';
import { Badge } from '@/components/ui';
import { mockTemplates } from '@/lib/mock/templates';

function getHeadline(headline: any): string {
  if (!headline) return '';
  if (typeof headline === 'string') return headline;
  if (typeof headline === 'object' && headline.title) return headline.title;
  return '';
}

interface ResumePreviewPanelProps {
  resume: Resume;
  settings: TemplateSettings;
  onSettingsChange: (s: Partial<TemplateSettings>) => void;
}

export function ResumePreviewPanel({ resume, settings, onSettingsChange }: ResumePreviewPanelProps) {
  const [zoom, setZoom] = useState(0.6);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showSettings, setShowSettings] = useState(false);

  const accentColors = ['#3B7A8C', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#1e293b'];

  return (
    <div className="sticky top-20 space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2 flex-wrap gap-2">
        {/* Direct Template Switcher */}
        <div className="flex items-center gap-1">
          {mockTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSettingsChange({ templateId: t.id })}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                settings.templateId === t.id
                  ? 'bg-prism-600 text-white shadow-xs font-semibold'
                  : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
              }`}
              title={t.description}
            >
              {t.name.replace(' Professional', '').replace(' Executive', '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} className="p-1.5 rounded hover:bg-warm-100 text-warm-500 cursor-pointer" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-warm-500 w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1, zoom + 0.1))} className="p-1.5 rounded hover:bg-warm-100 text-warm-500 cursor-pointer" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={() => setDevice(device === 'desktop' ? 'mobile' : 'desktop')}
            className={`p-1.5 rounded cursor-pointer ${device === 'mobile' ? 'bg-warm-200 text-navy-800' : 'hover:bg-warm-100 text-warm-500'}`}
            aria-label="Toggle device preview"
          >
            {device === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded cursor-pointer ${showSettings ? 'bg-warm-200 text-navy-800' : 'hover:bg-warm-100 text-warm-500'}`}
            aria-label="Toggle styling controls"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Style drawer */}
      {showSettings && (
        <div className="bg-white border border-border rounded-lg p-4 space-y-4 animate-fade-in">
          <div>
            <label className="text-xs font-medium text-navy-800 block mb-2">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {mockTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSettingsChange({ templateId: t.id })}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                    settings.templateId === t.id ? 'border-prism-500 bg-prism-50' : 'border-border hover:border-warm-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-navy-800">{t.name}</p>
                  <Badge variant={t.label === 'ATS Safe' ? 'success' : 'default'} className="mt-1 !text-[9px]">
                    {t.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-navy-800 block mb-2">Font Size: {settings.fontSize}pt</label>
            <input type="range" min="8" max="13" value={Number(settings.fontSize) || 10} onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })} className="w-full accent-prism-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-800 block mb-2">Spacing: {settings.spacing}x</label>
            <input type="range" min="0.8" max="1.5" step="0.1" value={Number(settings.spacing) || 1.0} onChange={(e) => onSettingsChange({ spacing: Number(e.target.value) })} className="w-full accent-prism-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-800 block mb-2">Accent Color</label>
            <div className="flex gap-2">
              {accentColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onSettingsChange({ accentColor: color })}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${settings.accentColor === color ? 'ring-2 ring-offset-2 ring-prism-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview area */}
      <div className={`bg-warm-100 border border-border rounded-lg p-4 overflow-auto ${device === 'mobile' ? 'max-w-[320px] mx-auto' : ''}`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: device === 'mobile' ? '100%' : '210mm' }}>
          <ResumeDocument resume={resume} settings={settings} />
        </div>
      </div>
    </div>
  );
}

// ── Resume Document Renderer ────────────────────────────────────
function ResumeDocument({ resume, settings }: { resume: Resume; settings: TemplateSettings }) {
  const templateId = settings.templateId as TemplateId;
  const visibleSections = resume.sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const accentColor = settings.accentColor;
  const fontSize = typeof settings.fontSize === 'number' ? settings.fontSize : parseFloat(String(settings.fontSize)) || 10;
  const spacing = typeof settings.spacing === 'number' ? settings.spacing : parseFloat(String(settings.spacing)) || 1.0;

  if (templateId === 'modern-split') {
    return <ModernSplitTemplate resume={resume} sections={visibleSections} accentColor={accentColor} fontSize={fontSize} spacing={spacing} />;
  }
  if (templateId === 'minimal-executive') {
    return <MinimalExecutiveTemplate resume={resume} sections={visibleSections} accentColor={accentColor} fontSize={fontSize} spacing={spacing} />;
  }
  return <ATSProfessionalTemplate resume={resume} sections={visibleSections} accentColor={accentColor} fontSize={fontSize} spacing={spacing} />;
}

interface TemplateProps {
  resume: Resume;
  sections: { type: string; visible: boolean }[];
  accentColor: string;
  fontSize: number;
  spacing: number;
}

// ── Template 1: ATS Professional ────────────────────────────────
function ATSProfessionalTemplate({ resume, sections, accentColor, fontSize, spacing }: TemplateProps) {
  const base = fontSize;
  const gap = spacing * 12;
  const sectionTypes = sections.map((s) => s.type);
  const headline = getHeadline(resume.headline);

  return (
    <div className="resume-page" style={{ fontFamily: "'Inter', sans-serif", fontSize: `${base}pt`, lineHeight: `${spacing * 1.5}` }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: `${gap}px` }}>
        <h1 style={{ fontSize: `${base * 2}pt`, fontWeight: 700, color: '#0f1b2d', margin: 0 }}>
          {resume.personal.fullName || 'Your Name'}
        </h1>
        {headline && (
          <p style={{ fontSize: `${base * 1.1}pt`, color: accentColor, marginTop: '4px', fontWeight: 500 }}>
            {headline}
          </p>
        )}
        <p style={{ fontSize: `${base * 0.9}pt`, color: '#7a7168', marginTop: '6px' }}>
          {[resume.personal.email, resume.personal.phone, resume.personal.location].filter(Boolean).join(' • ')}
        </p>
        {(resume.personal.linkedin || resume.personal.github || resume.personal.website) && (
          <p style={{ fontSize: `${base * 0.85}pt`, color: accentColor, marginTop: '3px' }}>
            {[resume.personal.linkedin, resume.personal.github, resume.personal.website].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>

      {/* Sections */}
      {sectionTypes.includes('summary') && resume.summary && (
        <Section title="Professional Summary" accentColor={accentColor} fontSize={base} gap={gap}>
          <p style={{ color: '#3d3833' }}>{resume.summary}</p>
        </Section>
      )}

      {sectionTypes.includes('experience') && resume.experience.length > 0 && (
        <Section title="Experience" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: `${gap * 0.8}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <strong style={{ color: '#0f1b2d' }}>{exp.title || exp.role}</strong>
                <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div style={{ color: accentColor, fontSize: `${base * 0.95}pt` }}>{exp.company} {exp.location && `• ${exp.location}`}</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: '16px', color: '#3d3833' }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: '3px' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('education') && resume.education.length > 0 && (
        <Section title="Education" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: `${gap * 0.6}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <strong style={{ color: '#0f1b2d' }}>{edu.field ? `${edu.degree} in ${edu.field}` : edu.degree}</strong>
                <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div style={{ color: accentColor, fontSize: `${base * 0.95}pt` }}>{edu.school || edu.institution} {edu.location && `• ${edu.location}`}</div>
              {edu.gpa && <div style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('skills') && resume.skills.length > 0 && (
        <Section title="Skills" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.skills.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#0f1b2d' }}>{cat.category}: </strong>
              <span style={{ color: '#3d3833' }}>{cat.skills.join(', ')}</span>
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('projects') && resume.projects.length > 0 && (
        <Section title="Projects" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: `${gap * 0.6}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <strong style={{ color: '#0f1b2d' }}>{proj.name}</strong>
                {proj.role && <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{proj.role}</span>}
              </div>
              {proj.description && <p style={{ color: '#3d3833', margin: '2px 0 0' }}>{proj.description}</p>}
              {proj.technologies && proj.technologies.length > 0 && (
                <div style={{ color: accentColor, fontSize: `${base * 0.85}pt`, marginTop: '2px' }}>
                  {proj.technologies.join(' • ')}
                </div>
              )}
              {proj.bullets && proj.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: '16px', color: '#3d3833' }}>
                  {proj.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: '2px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('certifications') && resume.certifications.length > 0 && (
        <Section title="Certifications" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: '#0f1b2d' }}>{cert.name}</strong>
                <span style={{ color: '#7a7168' }}> — {cert.issuer}</span>
              </div>
              {cert.date && <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{cert.date}</span>}
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('achievements') && resume.achievements.length > 0 && (
        <Section title="Key Achievements" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.achievements.map((ach) => (
            <div key={ach.id} style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#0f1b2d' }}>{ach.title}: </strong>
              <span style={{ color: '#3d3833' }}>{ach.description}</span>
            </div>
          ))}
        </Section>
      )}

      {sectionTypes.includes('languages') && resume.languages.length > 0 && (
        <Section title="Languages" accentColor={accentColor} fontSize={base} gap={gap}>
          <p style={{ color: '#3d3833' }}>
            {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join('  •  ')}
          </p>
        </Section>
      )}
    </div>
  );
}

// ── Template 2: Modern Split ────────────────────────────────────
function ModernSplitTemplate({ resume, sections, accentColor, fontSize, spacing }: TemplateProps) {
  const base = fontSize;
  const gap = spacing * 12;
  const sectionTypes = sections.map((s) => s.type);
  const headline = getHeadline(resume.headline);

  return (
    <div className="resume-page !p-0" style={{ fontFamily: "'Inter', sans-serif", fontSize: `${base}pt`, lineHeight: `${spacing * 1.5}`, display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '35%', backgroundColor: accentColor, color: 'white', padding: '24px 16px' }}>
        <h1 style={{ fontSize: `${base * 1.6}pt`, fontWeight: 700, margin: '0 0 4px' }}>
          {resume.personal.fullName || 'Your Name'}
        </h1>
        {headline && (
          <p style={{ fontSize: `${base * 0.95}pt`, opacity: 0.85, marginBottom: '16px' }}>{headline}</p>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', marginTop: '8px' }}>
          <SidebarSection title="Contact" fontSize={base}>
            {resume.personal.email && <p style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9 }}>{resume.personal.email}</p>}
            {resume.personal.phone && <p style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9 }}>{resume.personal.phone}</p>}
            {resume.personal.location && <p style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9 }}>{resume.personal.location}</p>}
            {resume.personal.linkedin && <p style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9 }}>{resume.personal.linkedin}</p>}
          </SidebarSection>
        </div>

        {sectionTypes.includes('skills') && resume.skills.length > 0 && (
          <SidebarSection title="Skills" fontSize={base}>
            {resume.skills.map((cat) => (
              <div key={cat.id} style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: `${base * 0.85}pt`, fontWeight: 600, marginBottom: '2px' }}>{cat.category}</p>
                <p style={{ fontSize: `${base * 0.8}pt`, opacity: 0.85 }}>{cat.skills.join(', ')}</p>
              </div>
            ))}
          </SidebarSection>
        )}

        {sectionTypes.includes('languages') && resume.languages.length > 0 && (
          <SidebarSection title="Languages" fontSize={base}>
            {resume.languages.map((l) => (
              <p key={l.id} style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9 }}>{l.language} — {l.proficiency}</p>
            ))}
          </SidebarSection>
        )}

        {sectionTypes.includes('certifications') && resume.certifications.length > 0 && (
          <SidebarSection title="Certifications" fontSize={base}>
            {resume.certifications.map((c) => (
              <p key={c.id} style={{ fontSize: `${base * 0.85}pt`, opacity: 0.9, marginBottom: '4px' }}>{c.name}<br /><span style={{ opacity: 0.7 }}>{c.issuer}, {c.date}</span></p>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '24px 20px' }}>
        {sectionTypes.includes('summary') && resume.summary && (
          <Section title="Summary" accentColor={accentColor} fontSize={base} gap={gap}>
            <p style={{ color: '#3d3833' }}>{resume.summary}</p>
          </Section>
        )}

        {sectionTypes.includes('experience') && resume.experience.length > 0 && (
          <Section title="Experience" accentColor={accentColor} fontSize={base} gap={gap}>
            {resume.experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: `${gap * 0.8}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#0f1b2d' }}>{exp.title || exp.role}</strong>
                  <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div style={{ color: accentColor, fontSize: `${base * 0.95}pt` }}>{exp.company}</div>
                <ul style={{ margin: '4px 0 0', paddingLeft: '14px', color: '#3d3833' }}>
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: '2px' }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {sectionTypes.includes('education') && resume.education.length > 0 && (
          <Section title="Education" accentColor={accentColor} fontSize={base} gap={gap}>
            {resume.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: `${gap * 0.5}px` }}>
                <strong style={{ color: '#0f1b2d' }}>{edu.field ? `${edu.degree} in ${edu.field}` : edu.degree}</strong>
                <div style={{ color: accentColor, fontSize: `${base * 0.95}pt` }}>{edu.school || edu.institution}</div>
                <span style={{ color: '#7a7168', fontSize: `${base * 0.9}pt` }}>{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </Section>
        )}

        {sectionTypes.includes('projects') && resume.projects.length > 0 && (
          <Section title="Projects" accentColor={accentColor} fontSize={base} gap={gap}>
            {resume.projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: `${gap * 0.5}px` }}>
                <strong style={{ color: '#0f1b2d' }}>{proj.name}</strong>
                <p style={{ color: '#3d3833', marginTop: '2px' }}>{proj.description}</p>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Template 3: Minimal Executive ───────────────────────────────
function MinimalExecutiveTemplate({ resume, sections, accentColor, fontSize, spacing }: TemplateProps) {
  const base = fontSize;
  const gap = spacing * 16;
  const sectionTypes = sections.map((s) => s.type);
  const headline = getHeadline(resume.headline);

  return (
    <div className="resume-page" style={{ fontFamily: "'Inter', sans-serif", fontSize: `${base}pt`, lineHeight: `${spacing * 1.6}`, padding: '28mm 22mm' }}>
      <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '12px', marginBottom: `${gap}px` }}>
        <h1 style={{ fontSize: `${base * 2.2}pt`, fontWeight: 300, color: '#0f1b2d', margin: 0, letterSpacing: '0.5px' }}>
          {resume.personal.fullName || 'Your Name'}
        </h1>
        {headline && (
          <p style={{ fontSize: `${base * 1.1}pt`, color: accentColor, marginTop: '4px', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {headline}
          </p>
        )}
        <p style={{ fontSize: `${base * 0.85}pt`, color: '#7a7168', marginTop: '8px', letterSpacing: '0.3px' }}>
          {[resume.personal.email, resume.personal.phone, resume.personal.location].filter(Boolean).join('  ·  ')}
        </p>
      </div>

      {sectionTypes.includes('summary') && resume.summary && (
        <ExecSection title="Profile" accentColor={accentColor} fontSize={base} gap={gap}>
          <p style={{ color: '#3d3833', fontStyle: 'italic' }}>{resume.summary}</p>
        </ExecSection>
      )}

      {sectionTypes.includes('experience') && resume.experience.length > 0 && (
        <ExecSection title="Experience" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: `${gap * 0.7}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#0f1b2d', fontSize: `${base * 1.05}pt` }}>{exp.title || exp.role}</strong>
                  <span style={{ color: '#7a7168' }}> — {exp.company}</span>
                </div>
                <span style={{ color: '#9a9185', fontSize: `${base * 0.9}pt`, whiteSpace: 'nowrap' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <ul style={{ margin: '6px 0 0', paddingLeft: '16px', color: '#3d3833' }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: '3px' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </ExecSection>
      )}

      {sectionTypes.includes('education') && resume.education.length > 0 && (
        <ExecSection title="Education" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#0f1b2d' }}>{edu.field ? `${edu.degree}, ${edu.field}` : edu.degree}</strong>
              <span style={{ color: '#7a7168' }}> — {edu.school || edu.institution}, {edu.endDate}</span>
            </div>
          ))}
        </ExecSection>
      )}

      {sectionTypes.includes('skills') && resume.skills.length > 0 && (
        <ExecSection title="Expertise" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.skills.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '4px' }}>
              <span style={{ color: '#0f1b2d', fontWeight: 600 }}>{cat.category}: </span>
              <span style={{ color: '#3d3833' }}>{cat.skills.join('  ·  ')}</span>
            </div>
          ))}
        </ExecSection>
      )}

      {sectionTypes.includes('certifications') && resume.certifications.length > 0 && (
        <ExecSection title="Certifications" accentColor={accentColor} fontSize={base} gap={gap}>
          {resume.certifications.map((c) => (
            <p key={c.id} style={{ color: '#3d3833', marginBottom: '3px' }}>{c.name} — {c.issuer} ({c.date})</p>
          ))}
        </ExecSection>
      )}
    </div>
  );
}

// ── Shared section components ───────────────────────────────────
function Section({ title, accentColor, fontSize, gap, children }: { title: string; accentColor: string; fontSize: number; gap: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: `${gap}px` }}>
      <h2 style={{ fontSize: `${fontSize * 1.15}pt`, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${accentColor}30`, paddingBottom: '4px', marginBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SidebarSection({ title, fontSize, children }: { title: string; fontSize: number; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', marginTop: '10px' }}>
      <h3 style={{ fontSize: `${fontSize * 0.8}pt`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', opacity: 0.7 }}>{title}</h3>
      {children}
    </div>
  );
}

function ExecSection({ title, accentColor, fontSize, gap, children }: { title: string; accentColor: string; fontSize: number; gap: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: `${gap}px` }}>
      <h2 style={{ fontSize: `${fontSize * 0.9}pt`, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
