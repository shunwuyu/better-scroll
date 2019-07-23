import { Page } from 'puppeteer'
import extendTouch from '../../util/extendTouch'
import getTranslate from '../../util/getTranslate'

jest.setTimeout(10000000)

describe('Nested vertical scroll', () => {
  let page = (global as any).page as Page
  extendTouch(page)
  beforeAll(async () => {
    await page.goto(
      'http://0.0.0.0:8932/#/nested-scroll/nested-vertical-scroll'
    )
  })
  beforeEach(async () => {
    await page.reload({
      waitUntil: 'domcontentloaded'
    })
  })

  it('should make outer BScroll scroll when manipulating outerBScroll', async () => {
    await page.waitFor(300)

    await page.dispatchScroll({
      x: 160,
      y: 150,
      xDistance: 0,
      yDistance: -70,
      gestureSourceType: 'touch'
    })

    await page.waitFor(2500)

    const transformText = await page.$eval('.scroll-outer-content', node => {
      return window.getComputedStyle(node).transform
    })

    const translateY = getTranslate(transformText!, 'y')
    await expect(translateY).toBeLessThan(-30)
  })

  it('should only make innerBScroll scroll and outerBScroll stop', async () => {
    await page.waitFor(300)

    const oldOuterTransformText = await page.$eval(
      '.scroll-outer-content',
      node => {
        return window.getComputedStyle(node).transform
      }
    )
    const oldOuterTranslateY = getTranslate(oldOuterTransformText!, 'y')

    await page.dispatchScroll({
      x: 160,
      y: 430,
      xDistance: 0,
      yDistance: -70,
      gestureSourceType: 'touch'
    })

    await page.waitFor(2500)

    const outerTransformText = await page.$eval(
      '.scroll-outer-content',
      node => {
        return window.getComputedStyle(node).transform
      }
    )

    const outerTranslateY = getTranslate(outerTransformText!, 'y')
    await expect(outerTranslateY).toBe(oldOuterTranslateY)

    const innerTransformText = await page.$eval(
      '.scroll-inner-content',
      node => {
        return window.getComputedStyle(node).transform
      }
    )

    const innerTranslateY = getTranslate(innerTransformText!, 'y')
    await expect(innerTranslateY).toBeLessThan(-30)
  })

  it('should make outer BScroll scroll when innerScroll reached boundary', async () => {
    await page.waitFor(300)

    await page.dispatchScroll({
      x: 160,
      y: 430,
      xDistance: 0,
      yDistance: -500,
      speed: 1400,
      gestureSourceType: 'touch'
    })

    await page.waitFor(2500)

    const innerTransformText = await page.$eval(
      '.scroll-inner-content',
      node => {
        return window.getComputedStyle(node).transform
      }
    )

    const innerTranslateY = getTranslate(innerTransformText!, 'y')
    await expect(innerTranslateY).toBeLessThan(-50)

    await page.dispatchScroll({
      x: 160,
      y: 430,
      xDistance: 0,
      yDistance: -50,
      gestureSourceType: 'touch'
    })

    const outerTransformText = await page.$eval(
      '.scroll-outer-content',
      node => {
        return window.getComputedStyle(node).transform
      }
    )
    const outerTranslateY = getTranslate(outerTransformText!, 'y')
    await expect(outerTranslateY).toBeLessThan(-50)
  })
})