class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Full-text search
  search() {
    const keyword = this.queryStr.keyword
      ? { $text: { $search: this.queryStr.keyword } }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Filter by category, brand, price range, rating
  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    removeFields.forEach((f) => delete queryCopy[f]);

    // Advanced filter: gte, gt, lte, lt
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Select specific fields
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  // Pagination
  paginate(resPerPage = 12) {
    const page    = parseInt(this.queryStr.page, 10)  || 1;
    const limit   = parseInt(this.queryStr.limit, 10) || resPerPage;
    const skip    = (page - 1) * limit;
    this.query    = this.query.skip(skip).limit(limit);
    this.page     = page;
    this.limit    = limit;
    return this;
  }
}

module.exports = ApiFeatures;
