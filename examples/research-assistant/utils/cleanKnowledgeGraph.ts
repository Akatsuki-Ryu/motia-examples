import { KnowledgeGraph, RelatedPaper } from '../types/knowledgeGraph';
import fs from 'fs';

/**
 * Clean the knowledge graph by removing invalid or placeholder entries
 * @param knowledgeGraphPath Path to the knowledge graph JSON file
 * @returns Cleaned knowledge graph object
 */
export function cleanKnowledgeGraph(knowledgeGraphPath: string): KnowledgeGraph {
  try {
    // Read and parse the knowledge graph
    const knowledgeGraphData = fs.readFileSync(knowledgeGraphPath, 'utf-8');
    const knowledgeGraph: KnowledgeGraph = JSON.parse(knowledgeGraphData);

    // Clean papers with invalid related papers
    Object.keys(knowledgeGraph.papers).forEach(paperId => {
      const paper = knowledgeGraph.papers[paperId];
      
      // Clean related papers
      if (paper.internetRelatedPapers && Array.isArray(paper.internetRelatedPapers)) {
        // Filter out invalid related papers
        paper.internetRelatedPapers = paper.internetRelatedPapers.filter(isValidRelatedPaper);
      }
    });

    // Clean invalid concepts (those with "Unknown Title")
    const conceptsToRemove: string[] = [];
    Object.keys(knowledgeGraph.concepts).forEach(conceptName => {
      if (conceptName.includes('Unknown Title')) {
        conceptsToRemove.push(conceptName);
      }
    });
    
    // Remove invalid concepts
    conceptsToRemove.forEach(conceptName => {
      delete knowledgeGraph.concepts[conceptName];
    });

    // Clean invalid relationships
    knowledgeGraph.relationships = knowledgeGraph.relationships.filter(relationship => {
      // Keep relationships that don't include "Unknown Title"
      return !relationship.target.includes('Unknown Title');
    });

    return knowledgeGraph;
  } catch (error) {
    console.error('Error cleaning knowledge graph:', error);
    throw error;
  }
}

/**
 * Check if a related paper entry is valid (not a placeholder)
 */
function isValidRelatedPaper(paper: RelatedPaper | any): boolean {
  return (
    paper && 
    typeof paper === 'object' &&
    paper.title && 
    paper.title !== 'Unknown Title' &&
    paper.authors && 
    paper.authors !== 'Unknown Authors'
  );
}
