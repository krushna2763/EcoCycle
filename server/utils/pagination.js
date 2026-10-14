// Parse ?page=&limit= into safe numbers with a capped page size
export const parsePagination = (query, { defaultLimit = 20, maxLimit = 50 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit)
  return { page, limit, skip: (page - 1) * limit }
}

export const pageInfo = ({ page, limit }, total) => ({ total, page, pages: Math.max(Math.ceil(total / limit), 1) })
