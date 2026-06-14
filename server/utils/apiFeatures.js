class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const { category, minPrice, maxPrice, size, color,
      isFeatured, isNew, isSale } = this.queryString

    const filter = {}

    if (category) filter.category = category
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true'
    if (isNew !== undefined) filter.isNew = isNew === 'true'
    if (isSale !== undefined) filter.isSale = isSale === 'true'

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice)
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice)
    }

    if (size) filter.sizes = { $in: size.split(',') }
    if (color) filter.colors = { $in: color.split(',') }

    this.query = this.query.find(filter)
    return this
  }

  search() {
    const { search } = this.queryString
    if (search) {
      const regex = new RegExp(search, 'i')
      this.query = this.query.find({
        $or: [{ name: regex }, { description: regex }],
      })
    }
    return this
  }

  sort() {
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      top_rated: { rating: -1 },
    }
    const sortBy = sortMap[this.queryString.sortBy] || { createdAt: -1 }
    this.query = this.query.sort(sortBy)
    return this
  }

  paginate() {
    const page = Math.max(1, Number(this.queryString.page) || 1)
    const limit = Math.min(50, Number(this.queryString.limit) || 12)
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    this._page = page
    this._limit = limit
    return this
  }
}

module.exports = APIFeatures
