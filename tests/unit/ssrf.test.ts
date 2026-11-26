import { describe, expect, it } from 'vitest'
import { assertSafeUrl, isBlockedIp } from '../../src/lib/security/ssrf'

describe('ssrf', () => {
  it('blocks private and link-local IPs', () => {
    expect(isBlockedIp('127.0.0.1')).toBe(true)
    expect(isBlockedIp('10.0.0.5')).toBe(true)
    expect(isBlockedIp('192.168.1.1')).toBe(true)
    expect(isBlockedIp('169.254.169.254')).toBe(true)
    expect(isBlockedIp('172.16.0.1')).toBe(true)
    expect(isBlockedIp('8.8.8.8')).toBe(false)
  })

  it('rejects localhost and credentials', async () => {
    expect((await assertSafeUrl('http://localhost/admin')).ok).toBe(false)
    expect((await assertSafeUrl('http://user:pass@example.com')).ok).toBe(false)
    expect((await assertSafeUrl('file:///etc/passwd')).ok).toBe(false)
    expect((await assertSafeUrl('http://127.0.0.1/')).ok).toBe(false)
    expect((await assertSafeUrl('http://169.254.169.254/latest/meta-data/')).ok).toBe(false)
  })

  it('allows public https hosts', async () => {
    const result = await assertSafeUrl('https://hn.algolia.com/api/v1/search?query=test')
    expect(result.ok).toBe(true)
  })
})
