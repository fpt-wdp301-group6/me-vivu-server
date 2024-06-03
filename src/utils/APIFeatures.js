class APIFeatures {
    constructor(schema, queryString) {
        this.schema = schema;
        this.query = schema.find();
        this.queryString = queryString;
    }

    deleted() {
        const { deleted } = this.queryString;
        if (deleted) {
            this.query.find({ deleted });
        }
        return this;
    }

    search(...fields) {
        const { search } = this.queryString;
        if (search) {
            const regex = new RegExp(search, 'i');
            const orQueries = fields.map((field) => ({ [field]: { $regex: regex } }));
            this.query.or(orQueries);
        }
        return this;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['search', 'page', 'sort', 'limit', 'fields', 'deleted'];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|eq)\b/g, (match) => `$${match}`);

        this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 30;
        const skip = (page - 1) * limit;
        // Count total documents
        if (this.query.getFilter().deleted === 'true') {
            this.total = this.schema.countDocumentsDeleted(this.query.getFilter());
        } else {
            this.total = this.schema.countDocuments(this.query.getFilter());
        }
        // Pagination
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
