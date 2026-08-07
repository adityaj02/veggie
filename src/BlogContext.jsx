import React, { createContext, useContext, useState, useEffect } from 'react'

const BlogContext = createContext()

const STORAGE_KEY = 'veggies_kitchen_blogs'

const INITIAL_BLOGS = [
  {
    id: 'b1',
    title: 'The Secret to Perfect Dal Makhani',
    author: 'Chef Shiv',
    date: 'Oct 15, 2023',
    content: 'Simmering black lentils and kidney beans over a slow charcoal fire for 24 hours is the only way to achieve that authentic, rich creaminess. It requires patience, love, and a touch of artisanal magic. This is how we have always prepared it at Veggies Kitchen, preserving the culinary heritage of our ancestors.'
  },
  {
    id: 'b2',
    title: 'Why Plant-Based Eating is the Future',
    author: 'Aarav Sharma',
    date: 'Nov 02, 2023',
    content: 'Switching to a plant-based diet isn\'t just a trend; it\'s a lifestyle shift that benefits both your health and the environment. I\'ve found that the flavors are richer, the ingredients fresher, and the feeling after a meal is entirely energizing. The Kadhai Paneer at Veggies Kitchen is a prime example of how you don\'t need meat to have a feast.'
  }
]

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setBlogs(JSON.parse(saved))
      } else {
        setBlogs(INITIAL_BLOGS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLOGS))
      }
    } catch (_e) {
      setBlogs(INITIAL_BLOGS)
    }
  }, [])

  const addBlog = (title, author, content) => {
    const newBlog = {
      id: `b_${Date.now()}`,
      title,
      author,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content
    }
    
    const updatedBlogs = [newBlog, ...blogs]
    setBlogs(updatedBlogs)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBlogs))
    } catch (e) {
      console.error('Failed to save blog to local storage', e)
    }
  }

  return (
    <BlogContext.Provider value={{ blogs, addBlog }}>
      {children}
    </BlogContext.Provider>
  )
}

export function useBlogs() {
  return useContext(BlogContext)
}
