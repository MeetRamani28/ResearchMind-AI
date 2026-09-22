from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

database_url = settings.DATABASE_URL

if database_url.startswith("sqlite"):
    engine = create_async_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=settings.APP_DEBUG,
    )
else:
    engine = create_async_engine(
        database_url,
        echo=settings.APP_DEBUG,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
