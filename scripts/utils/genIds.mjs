function generateUniqueIds() {
  return Math.random().toString(36).substring(5);
}
export default generateUniqueIds;