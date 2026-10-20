/* Example: a REST storage adapter for AC.files (sketch). */
export function restAdapter(base, token) {
  const call = async (path, init = {}) => {
    const res = await fetch(`${base}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
    if (!res.ok) throw Object.assign(new Error(res.statusText), { code: res.status === 409 ? 'EXIST' : 'EIO' });
    return res.json();
  };
  return {
    list: (id) => call(`/folders/${id}/children`),
    stat: (id) => call(`/items/${id}`),
    read: async (id) => ({ kind: 'auto', url: `${base}/items/${id}/content` }),
    thumbnail: (entry, size) => `${base}/items/${entry.id}/thumbnail?size=${size}`,
    rename: (id, name) => call(`/items/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
    trash: (ids) => call('/trash', { method: 'POST', body: JSON.stringify({ ids }) }),
  };
}
