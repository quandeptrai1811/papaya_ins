"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { glossaryData } from '@/data/glossary';
import Highlight from '@/components/Highlight';
import TermModal from '@/components/TermModal';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CATEGORIES = [...new Set(glossaryData.map(t => t.category))];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Filter logic
  const filteredData = useMemo(() => {
    let result = glossaryData;

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(t => t.category === activeCategory);
    }

    // Filter by Search
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(t => 
        t.term.toLowerCase().includes(q) || 
        t.definition.toLowerCase().includes(q)
      );
    }

    // Group by category for display
    const grouped = {};
    result.forEach(term => {
      if (!grouped[term.category]) {
        grouped[term.category] = [];
      }
      grouped[term.category].push(term);
    });

    // Sort terms alphabetically within categories
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.term.localeCompare(b.term));
    });

    return grouped;
  }, [debouncedSearchQuery, activeCategory]);

  // Keep track of collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle A-Z Jump
  const handleAlphaJump = (letter) => {
    // Force expand all categories to ensure the target is visible
    setCollapsedCategories({});
    
    // Give react a tick to render expanded categories before scrolling
    setTimeout(() => {
      const elements = document.querySelectorAll('.term-card-title');
      for (let el of elements) {
        if (el.textContent.toUpperCase().startsWith(letter)) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const card = el.closest('.term-card');
          card.style.borderColor = 'var(--primary)';
          setTimeout(() => { card.style.borderColor = 'var(--border)'; }, 1000);
          break;
        }
      }
    }, 50);
  };

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Papaya <span>Glossary</span></h1>
          <p>Insurance Terminology</p>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Categories</h3>
            <ul className="nav-list">
              <li>
                <button 
                  className={`nav-item ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('All')}
                >
                  All Terms
                </button>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">Quick Jump</h3>
            <div className="alphabet-grid">
              {ALPHABET.map(letter => {
                const hasMatch = Object.values(filteredData).flat().some(t => t.term.toUpperCase().startsWith(letter));
                return (
                  <button 
                    key={letter}
                    className="alpha-btn"
                    disabled={!hasMatch}
                    onClick={() => handleAlphaJump(letter)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="search-header">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              ref={searchInputRef}
              type="text" 
              className="search-input"
              placeholder="Search terms or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-shortcut">⌘K</span>
          </div>
        </header>

        <div className="term-scroll-area" ref={scrollAreaRef}>
          {Object.keys(filteredData).length === 0 ? (
            <div className="empty-state">
              <h3>No terms found</h3>
              <p>We couldn't find anything matching "{debouncedSearchQuery}"</p>
            </div>
          ) : (
            Object.entries(filteredData).map(([category, terms]) => {
              const isCollapsed = collapsedCategories[category];
              return (
                <div key={category} className="category-group">
                  <div 
                    className="category-group-header" 
                    onClick={() => toggleCategory(category)}
                  >
                    <h2 className="category-group-title">{category} <span className="term-count">({terms.length})</span></h2>
                    <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="term-grid">
                      {terms.map(termData => (
                        <div 
                          key={termData.id} 
                          className="term-card"
                          onClick={() => setSelectedTerm(termData)}
                        >
                          <h3 className="term-card-title">
                            <Highlight text={termData.term} highlight={debouncedSearchQuery} />
                          </h3>
                          <p className="term-card-def">
                            <Highlight text={termData.definition} highlight={debouncedSearchQuery} />
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTerm && (
        <TermModal 
          termData={selectedTerm} 
          allTerms={glossaryData}
          onClose={() => setSelectedTerm(null)} 
          onSelectRelated={(term) => setSelectedTerm(term)}
        />
      )}

    </div>
  );
}
