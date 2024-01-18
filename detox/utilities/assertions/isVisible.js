/*global expect */
export async function elementIsVisible(ele) {
  try {
    await expect(ele).toBeVisible();
    return true;
  } catch (e) {
    return false;
  }
}
