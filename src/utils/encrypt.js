import { JSEncrypt } from "js-encrypt"

// 公钥
// const PublicKey =
//   "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiiOI9JzWlzzcKgk0hjbXJ+iodj1iCQpbhDzoMWe6CduGJt7GMNWRlPEXfR6GsBfvK8I6zRSa5KpP5o6yCLiDzvl/7YSgEBN9xmYMZZaxluuzhQ6unga3Wcc4AcIOIGJjtKdgcuvTFOunoyRrsBqselzd+RD8Ex5MPdWo19PHnHwIDAQAB"

/**
 * RSA加密
 * @author iori
 * @param str 输入的内容
 * @returns {string} RSA加密后的内容
 */
export function encrypt2RSA(str, PublicKey) {
  let encrypt = new JSEncrypt()
  encrypt.setPublicKey(PublicKey)
  return encrypt.encrypt(str)
}
