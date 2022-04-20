const DeFAULT_PAGE_LIMIT = 0;
const DeFAULT_PAGE_NUMBER = 1;

function getPagination (query) {
  const page = Math.abs(query.page) || DeFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DeFAULT_PAGE_LIMIT;

  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  }
}

module.exports = {
  getPagination
};