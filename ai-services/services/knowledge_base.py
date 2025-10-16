import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class KnowledgeBaseService:
    def __init__(self):
        # Mock knowledge base data
        self.articles = [
            {
                'id': 'KB001',
                'title': 'How to reset user password',
                'category': 'Authentication',
                'content': 'Step-by-step guide to reset user passwords in Active Directory...',
                'tags': ['password', 'reset', 'active directory', 'user management'],
                'views': 1250,
                'rating': 4.5,
                'created_at': '2024-01-01T00:00:00Z',
                'updated_at': '2024-01-15T10:30:00Z',
                'author': 'IT Admin',
                'status': 'published'
            },
            {
                'id': 'KB002',
                'title': 'VPN connection troubleshooting',
                'category': 'Network',
                'content': 'Common VPN connection issues and their solutions...',
                'tags': ['vpn', 'network', 'troubleshooting', 'connectivity'],
                'views': 890,
                'rating': 4.2,
                'created_at': '2024-01-02T00:00:00Z',
                'updated_at': '2024-01-10T14:20:00Z',
                'author': 'Network Team',
                'status': 'published'
            },
            {
                'id': 'KB003',
                'title': 'Software installation guide',
                'category': 'Applications',
                'content': 'Guide for installing approved software applications...',
                'tags': ['software', 'installation', 'applications', 'deployment'],
                'views': 756,
                'rating': 4.8,
                'created_at': '2024-01-03T00:00:00Z',
                'updated_at': '2024-01-12T09:15:00Z',
                'author': 'Application Team',
                'status': 'published'
            },
            {
                'id': 'KB004',
                'title': 'Email configuration setup',
                'category': 'Email',
                'content': 'How to configure email clients for company email...',
                'tags': ['email', 'configuration', 'outlook', 'setup'],
                'views': 634,
                'rating': 4.3,
                'created_at': '2024-01-04T00:00:00Z',
                'updated_at': '2024-01-08T16:45:00Z',
                'author': 'Email Admin',
                'status': 'published'
            }
        ]
        
        self.categories = [
            'Authentication',
            'Network',
            'Applications',
            'Email',
            'Hardware',
            'Security',
            'General'
        ]

    async def search(self, query: str, category: Optional[str] = None) -> Dict[str, Any]:
        """Search knowledge base articles"""
        try:
            query_lower = query.lower()
            results = []
            
            for article in self.articles:
                # Skip if category filter doesn't match
                if category and article['category'].lower() != category.lower():
                    continue
                
                # Calculate relevance score
                score = 0
                
                # Title match (highest weight)
                if query_lower in article['title'].lower():
                    score += 10
                
                # Tag match (medium weight)
                for tag in article['tags']:
                    if query_lower in tag.lower():
                        score += 5
                
                # Content match (lower weight)
                if query_lower in article['content'].lower():
                    score += 2
                
                # Category match (bonus)
                if query_lower in article['category'].lower():
                    score += 3
                
                if score > 0:
                    results.append({
                        **article,
                        'relevance_score': score
                    })
            
            # Sort by relevance score and rating
            results.sort(key=lambda x: (x['relevance_score'], x['rating']), reverse=True)
            
            return {
                'query': query,
                'category_filter': category,
                'total_results': len(results),
                'results': results[:10],  # Limit to top 10 results
                'search_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            raise

    async def add_article(self, article_data: Dict[str, Any]) -> str:
        """Add new article to knowledge base"""
        try:
            article_id = f"KB{len(self.articles) + 1:03d}"
            
            new_article = {
                'id': article_id,
                'title': article_data.get('title'),
                'category': article_data.get('category', 'General'),
                'content': article_data.get('content'),
                'tags': article_data.get('tags', []),
                'views': 0,
                'rating': 0.0,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'author': article_data.get('author', 'System'),
                'status': article_data.get('status', 'draft')
            }
            
            self.articles.append(new_article)
            
            logger.info(f"Added new knowledge base article: {article_id}")
            return article_id
            
        except Exception as e:
            logger.error(f"Error adding article: {str(e)}")
            raise

    async def get_article(self, article_id: str) -> Optional[Dict[str, Any]]:
        """Get specific article by ID"""
        try:
            for article in self.articles:
                if article['id'] == article_id:
                    # Increment view count
                    article['views'] += 1
                    return article
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting article {article_id}: {str(e)}")
            raise

    async def update_article(self, article_id: str, updates: Dict[str, Any]) -> bool:
        """Update existing article"""
        try:
            for i, article in enumerate(self.articles):
                if article['id'] == article_id:
                    # Update fields
                    for key, value in updates.items():
                        if key in article:
                            article[key] = value
                    
                    article['updated_at'] = datetime.now().isoformat()
                    self.articles[i] = article
                    
                    logger.info(f"Updated knowledge base article: {article_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating article {article_id}: {str(e)}")
            raise

    async def delete_article(self, article_id: str) -> bool:
        """Delete article from knowledge base"""
        try:
            for i, article in enumerate(self.articles):
                if article['id'] == article_id:
                    del self.articles[i]
                    logger.info(f"Deleted knowledge base article: {article_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting article {article_id}: {str(e)}")
            raise

    async def get_categories(self) -> List[str]:
        """Get list of available categories"""
        return self.categories

    async def get_popular_articles(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most popular articles by views"""
        try:
            sorted_articles = sorted(self.articles, key=lambda x: x['views'], reverse=True)
            return sorted_articles[:limit]
            
        except Exception as e:
            logger.error(f"Error getting popular articles: {str(e)}")
            raise

    async def get_recent_articles(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most recently updated articles"""
        try:
            sorted_articles = sorted(
                self.articles, 
                key=lambda x: x['updated_at'], 
                reverse=True
            )
            return sorted_articles[:limit]
            
        except Exception as e:
            logger.error(f"Error getting recent articles: {str(e)}")
            raise

    async def rate_article(self, article_id: str, rating: float) -> bool:
        """Rate an article"""
        try:
            for article in self.articles:
                if article['id'] == article_id:
                    # Simple rating update (in real implementation, would track individual ratings)
                    current_rating = article.get('rating', 0.0)
                    views = article.get('views', 1)
                    
                    # Calculate new average rating
                    new_rating = ((current_rating * (views - 1)) + rating) / views
                    article['rating'] = round(new_rating, 1)
                    
                    logger.info(f"Updated rating for article {article_id}: {new_rating}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error rating article {article_id}: {str(e)}")
            raise

    async def get_statistics(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        try:
            total_articles = len(self.articles)
            total_views = sum(article['views'] for article in self.articles)
            avg_rating = sum(article['rating'] for article in self.articles) / total_articles if total_articles > 0 else 0
            
            category_counts = {}
            for article in self.articles:
                category = article['category']
                category_counts[category] = category_counts.get(category, 0) + 1
            
            return {
                'total_articles': total_articles,
                'total_views': total_views,
                'average_rating': round(avg_rating, 2),
                'articles_by_category': category_counts,
                'most_viewed_article': max(self.articles, key=lambda x: x['views']) if self.articles else None,
                'highest_rated_article': max(self.articles, key=lambda x: x['rating']) if self.articles else None,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            raise

    async def suggest_articles(self, user_query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Suggest relevant articles based on user query"""
        try:
            # Use search functionality to find relevant articles
            search_results = await self.search(user_query)
            
            # Return top suggestions with additional context
            suggestions = []
            for article in search_results['results'][:limit]:
                suggestions.append({
                    'id': article['id'],
                    'title': article['title'],
                    'category': article['category'],
                    'relevance_score': article['relevance_score'],
                    'rating': article['rating'],
                    'views': article['views'],
                    'summary': article['content'][:200] + '...' if len(article['content']) > 200 else article['content']
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error suggesting articles: {str(e)}")
            raise