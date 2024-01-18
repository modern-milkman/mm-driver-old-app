export class PageObjectModel {
  /**
   * Gets a count of the number of elements matching the given selector.
   *
   * @param {*} element - the element selector.
   * @return the number of elements matching the given selector.
   * @memberof PageObjectModel
   */
  async count(element) {
    const attributes = await element.getAttributes();
    return attributes;
  }
}
