# Required empty JSON bodies and no-content acknowledgements

Specified before these handler corrections, 2026-09-20.

The recorded authoritative OpenAPI contracts declare a required JSON object body
for Registrar enable/disable auto-renew; IoT enable/disable hub and device and
renew device certificate; IPAM release IP; Jobs stop run; Mailbox restore mailbox
and validate domain records; and TEM cancel email, check domain and revoke domain.
These schemas have no required properties. Each handler must send `{}` and an
application/json Content-Type instead of omitting the body. This applies to the
IPAM DELETE request as documented; it is not a general method-based assumption.

Dedibox cancel install, reboot/start/stop server and start BMC access, plus Kafka
renew certificate authority, declare HTTP 204 without a response body. The SDK
correctly returns undefined. These operations must produce a local JSON
acknowledgement `{ success: true }`, never an undefined text block or a fabricated
upstream resource. Dedibox cancel-install does not declare a request body, so its
previous unsolicited `{}` is removed. Other operations retain their documented
request bodies. Offline transport tests derive expectations from the recorded
source contracts, including actual status and empty-body semantics.
