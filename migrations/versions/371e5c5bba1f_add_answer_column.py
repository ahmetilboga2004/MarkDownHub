"""add answer column

Revision ID: 371e5c5bba1f
Revises: 68147e33845d
Create Date: 2023-10-25 23:05:04.783147

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '371e5c5bba1f'
down_revision = '68147e33845d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('dersler', schema=None) as batch_op:
        batch_op.add_column(sa.Column('answer', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('dersler', schema=None) as batch_op:
        batch_op.drop_column('answer')

    # ### end Alembic commands ###
