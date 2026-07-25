import * as SecureStore from 'expo-secure-store';
import { loadSettings } from '../settings/settingsStore';

const JWT_KEY = 'drukstech:jwt';

export async function saveJwt(token: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getJwt(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function deleteJwt(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY);
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getJwt();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function dbg(msg: string) {
  console.log('[LicenseService]', msg);
}

export async function validateLicense(
  domainOrKey: string
): Promise<{ ok: true; jwt: string } | { ok: false; error: string }> {
  const settings = await loadSettings();
  const apiUrl = settings.licenseApiUrl || settings.validationApiUrl;
  if (!apiUrl) {
    return { ok: false, error: 'URL da API de licença não configurada.' };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: domainOrKey,
        appId: 'app.drukstech.mobile',
        timestamp: Date.now(),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Licença inválida: HTTP ${res.status} - ${body.slice(0, 200)}` };
    }

    const data = await res.json() as Record<string, unknown>;
    const jwt = typeof data.token === 'string' ? data.token : typeof data.jwt === 'string' ? data.jwt : null;

    if (!jwt) {
      return { ok: false, error: 'Resposta da API de licença sem token JWT.' };
    }

    await saveJwt(jwt);
    dbg('JWT salvo com sucesso');
    return { ok: true, jwt };
  } catch (e) {
    const msg = `Erro ao validar licença: ${(e as Error).message}`;
    dbg(msg);
    return { ok: false, error: msg };
  }
}

export async function checkLicenseValid(): Promise<boolean> {
  const token = await getJwt();
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1])
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}
