from supabase._async.client import AsyncClient, create_client
from .config import settings

_client: AsyncClient | None = None


async def get_supabase() -> AsyncClient:
    """Singleton Supabase client. Uses service-role key if valid, else anon key."""
    global _client
    if _client is None:
        _client = await create_client(settings.supabase_url, settings.db_key)
    return _client


# Alias — both DB ops and auth validation use the same client
# (anon key is sufficient for auth.get_user() with a valid user JWT)
async def get_supabase_anon() -> AsyncClient:
    return await get_supabase()
