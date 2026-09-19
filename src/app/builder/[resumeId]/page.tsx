'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, AlignLeft, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Trophy, Globe, Plus, Eye, PenLine,
  Save, CheckCircle, Sparkles, Trash2, ChevronUp, ChevronDown,
  EyeOff, X, Undo2, Type, BarChart3, Download
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button, Input, Textarea, Badge, Tabs, Card } from '@/components/ui';
import { Resume, ExperienceEntry, EducationEntry, SkillCategory, ProjectEntry, CertificationEntry, AchievementEntry, LanguageEntry, SectionType } from '@/types/resume';
import { ResumePreviewPanel } from '@/components/builder/ResumePreview';
import { AIAssistantDrawer } from '@/components/builder/AIAssistant';

interface BuilderPageProps {
  params: Promise<{ resumeId: string }>;
}

const sectionIcons: Record<SectionType, React.ReactNode> = {
  personal: <User className="w-4 h-4" />,
  headline: <Type className="w-4 h-4" />,
  summary: <AlignLeft className="w-4 h-4" />,
  experience: <Briefcase className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  skills: <Wrench className="w-4 h-4" />,
  projects: <FolderOpen className="w-4 h-4" />,
  certifications: <Award className="w-4 h-4" />,
  achievements: <Trophy className="w-4 h-4" />,
  languages: <Globe className="w-4 h-4" />,
  custom: <Plus className="w-4 h-4" />,
};

const sectionLabels: Record<SectionType, string> = {
  personal: 'Personal Info',
  headline: 'Headline',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
  custom: 'Custom',
};

export default function BuilderPage({ params }: BuilderPageProps) {
  const { resumeId } = use(params);
  const { state, dispatch, addToast } = useApp();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionType>('personal');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiField, setAiField] = useState('');
  const [aiText, setAiText] = useState('');
  const [history, setHistory] = useState<Resume[]>([]);

  const [analyzing, setAnalyzing] = useState(false);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load resume directly from PostgreSQL
  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.resume) {
            const r = data.resume;
            const content = r.content || {};
            const fullResume: Resume = {
              id: r.id,
              title: r.title,
              templateId: r.templateId || 'ats-professional',
              atsScore: r.atsScore ?? undefined,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              personal: content.personal || {},
              headline: content.headline || '',
              summary: content.summary || '',
              experience: content.experience || [],
              education: content.education || [],
              skills: content.skills || [],
              projects: content.projects || [],
              certifications: content.certifications || [],
              achievements: content.achievements || [],
              languages: content.languages || [],
              sections: content.sections || [],
            };
            dispatch({ type: 'SET_CURRENT_RESUME', payload: fullResume });
            return;
          }
        }
        router.push('/dashboard');
      } catch {
        router.push('/dashboard');
      }
    }

    fetchResume();
  }, [resumeId, dispatch, router]);

  const resume = state.currentResume;

  const saveToDatabase = useCallback(async (current: Resume, createVersion = false) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/resumes/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: current.title,
          content: {
            personal: current.personal,
            headline: current.headline,
            summary: current.summary,
            experience: current.experience,
            education: current.education,
            skills: current.skills,
            projects: current.projects,
            certifications: current.certifications,
            achievements: current.achievements,
            languages: current.languages,
            sections: current.sections,
          },
          templateId: current.templateId,
          createVersion,
        }),
      });

      if (res.ok) {
        setSaveStatus('saved');
        if (createVersion) {
          addToast('success', 'Resume version snapshot saved');
        }
      } else {
        setSaveStatus('unsaved');
      }
    } catch {
      setSaveStatus('unsaved');
    }
  }, [addToast]);

  const updateResume = useCallback((updates: Partial<Resume>) => {
    if (!resume) return;
    if (history.length === 0 || history[history.length - 1] !== resume) {
      setHistory((h) => [...h.slice(-9), resume]);
    }
    const updated = { ...resume, ...updates, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_RESUME', payload: updated });
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(updated, false);
    }, 800);
  }, [resume, dispatch, history, saveToDatabase]);

  const handleUndo = () => {
    if (history.length > 0 && resume) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      dispatch({ type: 'UPDATE_RESUME', payload: prev });
      addToast('info', 'Undo applied');
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    if (!resume) return;
    const sections = resume.sections.map((s) => s.id === sectionId ? { ...s, visible: !s.visible } : s);
    updateResume({ sections });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!resume) return;
    const idx = resume.sections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= resume.sections.length) return;
    const sections = [...resume.sections];
    [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
    sections.forEach((s, i) => s.order = i);
    updateResume({ sections });
  };

  const openAI = (field: string, text: string) => {
    setAiField(field);
    setAiText(text);
    setAiDrawerOpen(true);
  };

  if (!resume) {
    return <div className="flex items-center justify-center py-20 text-warm-500">Loading...</div>;
  }

  const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-fade-in">
      {/* Builder header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <input
            value={resume.title}
            onChange={(e) => updateResume({ title: e.target.value })}
            className="text-lg font-bold text-navy-800 bg-transparent border-none outline-none focus:ring-0 min-w-0"
            aria-label="Resume title"
          />
          <Badge variant={saveStatus === 'saved' ? 'success' : saveStatus === 'saving' ? 'info' : 'warning'}>
            {saveStatus === 'saved' && <><CheckCircle className="w-3 h-3 mr-1" />Saved</>}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'unsaved' && 'Unsaved'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={history.length === 0} icon={<Undo2 className="w-3.5 h-3.5" />}>
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/analyzer/analysis-1')} icon={<BarChart3 className="w-3.5 h-3.5" />}>
            AI Analysis
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openAI('summary', resume.summary)} icon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Assist
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/export')} icon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
          <Button size="sm" onClick={() => { addToast('success', 'Resume saved (demo)'); }} icon={<Save className="w-3.5 h-3.5" />}>
            Save
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden mb-4">
        <Tabs
          tabs={[
            { id: 'edit', label: 'Edit', icon: <PenLine className="w-3.5 h-3.5" /> },
            { id: 'preview', label: 'Preview', icon: <Eye className="w-3.5 h-3.5" /> },
          ]}
          activeTab={mobileTab}
          onChange={(id) => setMobileTab(id as 'edit' | 'preview')}
        />
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6">
        {/* Left: Editor */}
        <div className={`flex-1 min-w-0 ${mobileTab === 'preview' ? 'hidden md:block' : ''}`}>
          {/* Section nav */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
            {sortedSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === section.type
                    ? 'bg-prism-50 text-prism-700'
                    : section.visible
                    ? 'text-warm-500 hover:bg-warm-50 hover:text-navy-800'
                    : 'text-warm-300 hover:bg-warm-50'
                }`}
              >
                {sectionIcons[section.type]}
                {sectionLabels[section.type]}
                {!section.visible && <EyeOff className="w-3 h-3" />}
              </button>
            ))}
          </div>

          {/* Section editor */}
          <Card className="!p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
                {sectionIcons[activeSection]}
                {sectionLabels[activeSection]}
              </h2>
              <div className="flex items-center gap-1">
                {activeSection !== 'personal' && (
                  <>
                    <button onClick={() => {
                      const sec = resume.sections.find((s) => s.type === activeSection);
                      if (sec) toggleSectionVisibility(sec.id);
                    }} className="p-1.5 rounded hover:bg-warm-100 text-warm-400 cursor-pointer" title="Toggle visibility">
                      {resume.sections.find((s) => s.type === activeSection)?.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => {
                      const sec = resume.sections.find((s) => s.type === activeSection);
                      if (sec) moveSection(sec.id, 'up');
                    }} className="p-1.5 rounded hover:bg-warm-100 text-warm-400 cursor-pointer" title="Move up">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => {
                      const sec = resume.sections.find((s) => s.type === activeSection);
                      if (sec) moveSection(sec.id, 'down');
                    }} className="p-1.5 rounded hover:bg-warm-100 text-warm-400 cursor-pointer" title="Move down">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Personal Info */}
            {activeSection === 'personal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={resume.personal.fullName} onChange={(e) => updateResume({ personal: { ...resume.personal, fullName: e.target.value } })} />
                <Input label="Email" type="email" value={resume.personal.email} onChange={(e) => updateResume({ personal: { ...resume.personal, email: e.target.value } })} />
                <Input label="Phone" value={resume.personal.phone} onChange={(e) => updateResume({ personal: { ...resume.personal, phone: e.target.value } })} />
                <Input label="Location" value={resume.personal.location} onChange={(e) => updateResume({ personal: { ...resume.personal, location: e.target.value } })} />
                <Input label="LinkedIn" value={resume.personal.linkedin ?? ''} onChange={(e) => updateResume({ personal: { ...resume.personal, linkedin: e.target.value } })} />
                <Input label="Website" value={resume.personal.website ?? ''} onChange={(e) => updateResume({ personal: { ...resume.personal, website: e.target.value } })} />
                <Input label="GitHub" value={resume.personal.github ?? ''} onChange={(e) => updateResume({ personal: { ...resume.personal, github: e.target.value } })} />
              </div>
            )}

            {/* Headline */}
            {activeSection === 'headline' && (
              <Input
                label="Professional Headline"
                value={typeof resume.headline === 'string' ? resume.headline : (resume.headline as { title?: string })?.title || ''}
                onChange={(e) => updateResume({ headline: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
              />
            )}

            {/* Summary */}
            {activeSection === 'summary' && (
              <div>
                <Textarea
                  label="Professional Summary"
                  value={resume.summary}
                  onChange={(e) => updateResume({ summary: e.target.value })}
                  placeholder="Write a brief professional summary..."
                  rows={4}
                />
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openAI('summary', resume.summary)} icon={<Sparkles className="w-3 h-3" />}>
                    Improve with AI
                  </Button>
                </div>
              </div>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                {resume.experience.map((exp, idx) => (
                  <ExperienceEditor
                    key={exp.id}
                    entry={exp}
                    index={idx}
                    onUpdate={(updated) => {
                      const experience = resume.experience.map((e) => e.id === updated.id ? updated : e);
                      updateResume({ experience });
                    }}
                    onDelete={() => {
                      updateResume({ experience: resume.experience.filter((e) => e.id !== exp.id) });
                      addToast('info', 'Experience entry removed');
                    }}
                    onAI={(text) => openAI('experience', text)}
                  />
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newExp: ExperienceEntry = {
                    id: `exp-${Date.now()}`, company: '', title: '', location: '',
                    startDate: '', endDate: '', current: false, bullets: [''],
                  };
                  updateResume({ experience: [...resume.experience, newExp] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Experience
                </Button>
              </div>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                {resume.education.map((edu) => (
                  <EducationEditor
                    key={edu.id}
                    entry={edu}
                    onUpdate={(updated) => {
                      const education = resume.education.map((e) => e.id === updated.id ? updated : e);
                      updateResume({ education });
                    }}
                    onDelete={() => {
                      updateResume({ education: resume.education.filter((e) => e.id !== edu.id) });
                    }}
                  />
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newEdu: EducationEntry = {
                    id: `edu-${Date.now()}`, school: '', institution: '', degree: '', field: '',
                    location: '', startDate: '', endDate: '', highlights: [],
                  };
                  updateResume({ education: [...resume.education, newEdu] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Education
                </Button>
              </div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                {resume.skills.map((cat) => (
                  <SkillCategoryEditor
                    key={cat.id}
                    category={cat}
                    onUpdate={(updated) => {
                      const skills = resume.skills.map((s) => s.id === updated.id ? updated : s);
                      updateResume({ skills });
                    }}
                    onDelete={() => {
                      updateResume({ skills: resume.skills.filter((s) => s.id !== cat.id) });
                    }}
                  />
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newCat: SkillCategory = { id: `sk-${Date.now()}`, category: '', skills: [] };
                  updateResume({ skills: [...resume.skills, newCat] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Skill Category
                </Button>
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                {resume.projects.map((proj) => (
                  <ProjectEditor
                    key={proj.id}
                    entry={proj}
                    onUpdate={(updated) => {
                      const projects = resume.projects.map((p) => p.id === updated.id ? updated : p);
                      updateResume({ projects });
                    }}
                    onDelete={() => {
                      updateResume({ projects: resume.projects.filter((p) => p.id !== proj.id) });
                    }}
                  />
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newProj: ProjectEntry = { id: `proj-${Date.now()}`, name: '', description: '', technologies: [], bullets: [], highlights: [] };
                  updateResume({ projects: [...resume.projects, newProj] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Project
                </Button>
              </div>
            )}

            {/* Certifications */}
            {activeSection === 'certifications' && (
              <div className="space-y-4">
                {resume.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <Input label="Certification Name" value={cert.name} onChange={(e) => {
                        const certifications = resume.certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c);
                        updateResume({ certifications });
                      }} className="flex-1" />
                      <button onClick={() => updateResume({ certifications: resume.certifications.filter((c) => c.id !== cert.id) })} className="p-1.5 text-warm-400 hover:text-error cursor-pointer ml-2 mt-6">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Issuer" value={cert.issuer} onChange={(e) => {
                        const certifications = resume.certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c);
                        updateResume({ certifications });
                      }} />
                      <Input label="Date" value={cert.date} onChange={(e) => {
                        const certifications = resume.certifications.map((c) => c.id === cert.id ? { ...c, date: e.target.value } : c);
                        updateResume({ certifications });
                      }} />
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newCert: CertificationEntry = { id: `cert-${Date.now()}`, name: '', issuer: '', date: '' };
                  updateResume({ certifications: [...resume.certifications, newCert] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Certification
                </Button>
              </div>
            )}

            {/* Achievements */}
            {activeSection === 'achievements' && (
              <div className="space-y-4">
                {resume.achievements.map((ach) => (
                  <div key={ach.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <Input label="Achievement" value={ach.title} onChange={(e) => {
                        const achievements = resume.achievements.map((a) => a.id === ach.id ? { ...a, title: e.target.value } : a);
                        updateResume({ achievements });
                      }} className="flex-1" />
                      <button onClick={() => updateResume({ achievements: resume.achievements.filter((a) => a.id !== ach.id) })} className="p-1.5 text-warm-400 hover:text-error cursor-pointer ml-2 mt-6">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input label="Description" value={ach.description} onChange={(e) => {
                      const achievements = resume.achievements.map((a) => a.id === ach.id ? { ...a, description: e.target.value } : a);
                      updateResume({ achievements });
                    }} />
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newAch: AchievementEntry = { id: `ach-${Date.now()}`, title: '', description: '' };
                  updateResume({ achievements: [...resume.achievements, newAch] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Achievement
                </Button>
              </div>
            )}

            {/* Languages */}
            {activeSection === 'languages' && (
              <div className="space-y-4">
                {resume.languages.map((lang) => (
                  <div key={lang.id} className="flex items-end gap-3 p-4 border border-border rounded-lg">
                    <Input label="Language" value={lang.language} onChange={(e) => {
                      const languages = resume.languages.map((l) => l.id === lang.id ? { ...l, language: e.target.value } : l);
                      updateResume({ languages });
                    }} className="flex-1" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-sm font-medium text-navy-800">Proficiency</label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => {
                          const languages = resume.languages.map((l) => l.id === lang.id ? { ...l, proficiency: e.target.value as LanguageEntry['proficiency'] } : l);
                          updateResume({ languages });
                        }}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-white text-navy-800 border-border cursor-pointer"
                      >
                        {['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => updateResume({ languages: resume.languages.filter((l) => l.id !== lang.id) })} className="p-1.5 text-warm-400 hover:text-error cursor-pointer mb-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => {
                  const newLang: LanguageEntry = { id: `lang-${Date.now()}`, language: '', proficiency: 'intermediate' };
                  updateResume({ languages: [...resume.languages, newLang] });
                }} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Language
                </Button>
              </div>
            )}

            {/* Custom */}
            {activeSection === 'custom' && (
              <div className="text-center py-8">
                <p className="text-sm text-warm-500">Custom sections let you add any additional information.</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => addToast('info', 'Custom sections coming in a future update')} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Custom Section
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Preview (desktop) */}
        <div className={`w-[440px] flex-shrink-0 ${mobileTab === 'edit' ? 'hidden md:block' : ''}`}>
          <ResumePreviewPanel resume={resume} settings={state.templateSettings} onSettingsChange={(s) => dispatch({ type: 'SET_TEMPLATE_SETTINGS', payload: s })} />
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        field={aiField}
        originalText={aiText}
        onApply={(text) => {
          if (aiField === 'summary') {
            updateResume({ summary: text });
          }
          addToast('success', 'AI suggestion applied');
          setAiDrawerOpen(false);
        }}
      />
    </div>
  );
}

// ── Sub-editors ─────────────────────────────────────────────────

function ExperienceEditor({ entry, index, onUpdate, onDelete, onAI }: {
  entry: ExperienceEntry; index: number;
  onUpdate: (e: ExperienceEntry) => void;
  onDelete: () => void;
  onAI: (text: string) => void;
}) {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-warm-400">Experience {index + 1}</span>
        <button onClick={onDelete} className="p-1 text-warm-400 hover:text-error cursor-pointer" aria-label="Delete experience">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Company" value={entry.company} onChange={(e) => onUpdate({ ...entry, company: e.target.value })} />
        <Input label="Role / Title" value={entry.title} onChange={(e) => onUpdate({ ...entry, title: e.target.value })} />
        <Input label="Location" value={entry.location} onChange={(e) => onUpdate({ ...entry, location: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Start" value={entry.startDate} onChange={(e) => onUpdate({ ...entry, startDate: e.target.value })} placeholder="Jan 2022" />
          <Input label="End" value={entry.current ? 'Present' : entry.endDate} onChange={(e) => onUpdate({ ...entry, endDate: e.target.value, current: e.target.value === 'Present' })} placeholder="Present" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy-800">Bullet Points</label>
        {entry.bullets.map((bullet, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-warm-300 mt-2.5 text-sm">•</span>
            <input
              value={bullet}
              onChange={(e) => {
                const bullets = [...entry.bullets];
                bullets[i] = e.target.value;
                onUpdate({ ...entry, bullets });
              }}
              className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white text-navy-800 border-border focus:border-prism-400 focus:ring-2 focus:ring-prism-100 focus:outline-none"
              placeholder="Describe an achievement or responsibility..."
            />
            <button onClick={() => onAI(bullet)} className="p-2 text-warm-400 hover:text-prism-600 cursor-pointer" title="Improve with AI">
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => {
              const bullets = entry.bullets.filter((_, j) => j !== i);
              onUpdate({ ...entry, bullets });
            }} className="p-2 text-warm-300 hover:text-error cursor-pointer" title="Remove bullet">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onUpdate({ ...entry, bullets: [...entry.bullets, ''] })} icon={<Plus className="w-3 h-3" />}>
          Add bullet
        </Button>
      </div>
    </div>
  );
}

function EducationEditor({ entry, onUpdate, onDelete }: {
  entry: EducationEntry;
  onUpdate: (e: EducationEntry) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-warm-400">Education</span>
        <button onClick={onDelete} className="p-1 text-warm-400 hover:text-error cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Institution" value={entry.school || entry.institution || ''} onChange={(e) => onUpdate({ ...entry, school: e.target.value, institution: e.target.value })} />
        <Input label="Degree" value={entry.degree} onChange={(e) => onUpdate({ ...entry, degree: e.target.value })} />
        <Input label="Field of Study" value={entry.field || ''} onChange={(e) => onUpdate({ ...entry, field: e.target.value })} />
        <Input label="Location" value={entry.location} onChange={(e) => onUpdate({ ...entry, location: e.target.value })} />
        <Input label="Start Year" value={entry.startDate} onChange={(e) => onUpdate({ ...entry, startDate: e.target.value })} />
        <Input label="End Year" value={entry.endDate} onChange={(e) => onUpdate({ ...entry, endDate: e.target.value })} />
      </div>
    </div>
  );
}

function SkillCategoryEditor({ category, onUpdate, onDelete }: {
  category: SkillCategory;
  onUpdate: (c: SkillCategory) => void;
  onDelete: () => void;
}) {
  const [newSkill, setNewSkill] = useState('');
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <Input label="Category" value={category.category} onChange={(e) => onUpdate({ ...category, category: e.target.value })} className="flex-1 !mb-0" />
        <button onClick={onDelete} className="p-1 text-warm-400 hover:text-error cursor-pointer ml-2 mt-6"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-100 text-warm-700 text-xs font-medium">
            {skill}
            <button onClick={() => onUpdate({ ...category, skills: category.skills.filter((_, j) => j !== i) })} className="text-warm-400 hover:text-error cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newSkill.trim()) {
              onUpdate({ ...category, skills: [...category.skills, newSkill.trim()] });
              setNewSkill('');
            }
          }}
          placeholder="Type a skill and press Enter"
          className="flex-1 px-3 py-1.5 text-sm border rounded-lg bg-white text-navy-800 border-border focus:border-prism-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ProjectEditor({ entry, onUpdate, onDelete }: {
  entry: ProjectEntry;
  onUpdate: (p: ProjectEntry) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-warm-400">Project</span>
        <button onClick={onDelete} className="p-1 text-warm-400 hover:text-error cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <Input label="Project Name" value={entry.name} onChange={(e) => onUpdate({ ...entry, name: e.target.value })} />
      <Textarea label="Description" value={entry.description} onChange={(e) => onUpdate({ ...entry, description: e.target.value })} rows={2} />
      <Input label="Technologies (comma-separated)" value={entry.technologies.join(', ')} onChange={(e) => onUpdate({ ...entry, technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
    </div>
  );
}
