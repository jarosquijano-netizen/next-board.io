'use client';

import { useState, useMemo } from 'react';
import { MeetingCard } from '@/types/meeting';
import { User, Search, X } from 'lucide-react';

interface PeopleFilterProps {
  cards: MeetingCard[];
  selectedPeople: string[];
  onPeopleChange: (people: string[]) => void;
  variant?: 'horizontal' | 'vertical'; // Default horizontal, vertical for side panel
}

export function PeopleFilter({ cards, selectedPeople, onPeopleChange, variant = 'horizontal' }: PeopleFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique people from cards
  const allPeople = useMemo(() => {
    const peopleSet = new Set<string>();
    
    cards.forEach(card => {
      // Add owner
      if (card.owner) peopleSet.add(card.owner);
      
      // Add all involved people (parse if string)
      if (card.involvedPeople) {
        try {
          const involved = typeof card.involvedPeople === 'string' 
            ? JSON.parse(card.involvedPeople) 
            : card.involvedPeople;
          if (Array.isArray(involved)) {
            involved.forEach(person => peopleSet.add(person));
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
      
      // Add primary contact
      if (card.primaryContact) peopleSet.add(card.primaryContact);
      
      // Add additional contacts (parse if string)
      if (card.additionalContacts) {
        try {
          const additional = typeof card.additionalContacts === 'string' 
            ? JSON.parse(card.additionalContacts) 
            : card.additionalContacts;
          if (Array.isArray(additional)) {
            additional.forEach(person => peopleSet.add(person));
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    });
    
    return Array.from(peopleSet).sort();
  }, [cards]);

  // Count cards per person
  const peopleWithCounts = useMemo(() => {
    return allPeople.map(person => {
      const count = cards.filter(card => {
        // Check owner
        if (card.owner === person) return true;
        
        // Check primary contact
        if (card.primaryContact === person) return true;
        
        // Check involved people (parse if string)
        if (card.involvedPeople) {
          try {
            const involved = typeof card.involvedPeople === 'string' 
              ? JSON.parse(card.involvedPeople) 
              : card.involvedPeople;
            if (Array.isArray(involved) && involved.includes(person)) return true;
          } catch (e) {
            // Invalid JSON, skip
          }
        }
        
        // Check additional contacts (parse if string)
        if (card.additionalContacts) {
          try {
            const additional = typeof card.additionalContacts === 'string' 
              ? JSON.parse(card.additionalContacts) 
              : card.additionalContacts;
            if (Array.isArray(additional) && additional.includes(person)) return true;
          } catch (e) {
            // Invalid JSON, skip
          }
        }
        
        return false;
      }).length;
      
      return { name: person, count };
    }).filter(p => 
      searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPeople, cards, searchQuery]);

  const togglePerson = (person: string) => {
    if (selectedPeople.includes(person)) {
      onPeopleChange(selectedPeople.filter(p => p !== person));
    } else {
      onPeopleChange([...selectedPeople, person]);
    }
  };

  if (allPeople.length === 0) {
    return null; // Don't show filter if no people
  }

  if (variant === 'vertical') {
    // Vertical layout for side panel - Search on top, names below
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-700 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">People:</span>
        </div>

        {/* Search Bar - Full Width */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border-0 pl-7 pr-7 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* People Pills - Below Search */}
        <div className="flex flex-wrap gap-1.5">
          {peopleWithCounts.map(({ name, count }) => {
            const isSelected = selectedPeople.includes(name);
            
            return (
              <button
                key={name}
                onClick={() => togglePerson(name)}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-all
                  flex items-center gap-1.5
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}
                `}
              >
                <span className="truncate max-w-[200px]">{name}</span>
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isSelected ? 'bg-blue-700' : 'bg-gray-300 dark:bg-slate-600'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clear Button */}
        {selectedPeople.length > 0 && (
          <button
            onClick={() => onPeopleChange([])}
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-1"
          >
            Clear all
          </button>
        )}

        {peopleWithCounts.length === 0 && searchQuery && (
          <p className="text-center text-gray-500 text-xs py-2">
            No people found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-3">
        {/* Left: Icon + Label + Search */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <User className="w-4 h-4 text-gray-700 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">People:</span>
        </div>

        {/* Compact Search */}
        <div className="relative w-48 flex-shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border-0 pl-7 pr-7 py-1.5 text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: People Pills */}
        <div className="flex-1 flex flex-wrap items-center gap-1.5">
          {peopleWithCounts.map(({ name, count }) => {
            const isSelected = selectedPeople.includes(name);
            
            return (
              <button
                key={name}
                onClick={() => togglePerson(name)}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-all
                  flex items-center gap-1.5
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}
                `}
              >
                <span className="truncate max-w-[100px]">{name}</span>
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isSelected ? 'bg-blue-700' : 'bg-gray-300 dark:bg-slate-600'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
          
          {/* Clear Button */}
          {selectedPeople.length > 0 && (
            <button
              onClick={() => onPeopleChange([])}
              className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {peopleWithCounts.length === 0 && searchQuery && (
        <p className="text-center text-gray-500 text-xs py-2 mt-2">
          No people found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
}

