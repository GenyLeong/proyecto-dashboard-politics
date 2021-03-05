import pandas as pd
import numpy as np
from datetime import datetime


def read_fb_ads_lib_data(file_input: str) -> pd.DataFrame:
    """
    This function reads the FB ads lib Data and add a new Aux Column to the table for further calculations.
    """

    df = pd.read_csv(file_input)

    # Create Aux Column
    df.loc[:, "Count"] = 1

    return df


def create_reactions_df(
    t_start,
    t_end,
    kind: str,
    df_input: pd.DataFrame,
):
    df = create_timestamp_indexes(df_raw=df_input,
                                  column="Beginning Of Interval")
    df_reaction = create_time_splits(df=df, t_start=t_start, t_end=t_end)

    df_reaction.reset_index(False, inplace=True)

    df_reaction = df_reaction.pivot(index='time',
                                    columns='candidato',
                                    values=kind)

    return df_reaction


def read_fb_data(file_1: str, file_2: str, file_3: str):

    df_mesa = pd.read_csv(file_1)
    df_camacho = pd.read_csv(file_2)
    df_arce = pd.read_csv(file_3)

    df_mesa.loc[:, "candidato"] = "Carlos Mesa"
    df_camacho.loc[:, "candidato"] = "Camacho"
    df_arce.loc[:, "candidato"] = "Arce"

    df = pd.concat([df_mesa, df_camacho, df_arce])
    df.reset_index(inplace=True)

    return df


def create_timestamp_indexes(
        df_raw: pd.DataFrame,
        column: str,
        format_date: str = '%Y-%m-%d %H:%M:%f') -> pd.DataFrame:
    """
        Create datestamp index for a pandas dataframe

        PARAMS:
        ------

        :params: df_raw = pd.DataFrame - The target pandas dataframe with a "timestamp like" column
        :params: column = string - the name of the "timestamp like" column.
        :params: format_date = string  - the expected timestamp format .


        RETURNS:
        -------

        :returns: df = pd.DataFrame - The input dataframe but with his index as timestamp 

    """

    df = df_raw.copy()

    df['time'] = pd.to_datetime(df[column], format=format_date)

    # df = df.drop(columns_to_remove, 1)
    df.set_index('time', inplace=True)

    return df


def create_time_splits(df: pd.DataFrame, t_start: datetime, t_end: datetime):
    """
    Creates a dataframe but filteted by time ranges.

    PARAMS:
    -------
    :params: df = pd.DataFrame - Pandas dataframe with timestamp index
    :params: t_start = datetime object - Where start the datetime of interest
    :params: t_end = datetime object - Where ends the datetime of interest

    """

    # print("Fecha de inicio de los tweets :", t_start)
    # print("Fecha de final de los tweets :", t_end)

    df_timed_p = df[df.index.tz_localize(None) >= t_start]
    df_timed_p = df_timed_p[df_timed_p.index.tz_localize(None) < t_end]

    # print("\n")
    # print("Tamaño de los Tweets antes : ", df.shape[0])
    # print("Tamaño de los Tweets despues del rango de fechas : ",
    #   df_timed_p.shape[0])

    return df_timed_p


def get_df_count_ads(df: pd.DataFrame):
    """
    df: timed index dataframe

    """

    df_cc = df[df["page_name"] == "Carlos D. Mesa Gisbert"]
    df_mas = df[df["page_name"] == "Lucho x mi país"]
    df_camacho = df[df["page_name"] == "Luis Fernando Camacho"]

    df_cc_t = df_cc[["Count"]].resample('D').sum()
    df_cc_t.loc[:, "Candidato"] = "Carlos D. Mesa Gisbert"

    df_mas_t = df_mas[["Count"]].resample('D').sum()
    print("payaso", df["page_name"])
    df_mas_t.loc[:, "Candidato"] = "Lucho x mi país"

    df_camacho_t = df_camacho[["Count"]].resample('D').sum()
    df_camacho_t.loc[:, "Candidato"] = "Luis Fernando Camacho"

    df_day = pd.concat([df_cc_t, df_mas_t, df_camacho_t])

    df_day_p = df_day.reset_index().pivot(index='time',
                                          columns='Candidato',
                                          values='Count')

    return df_day_p


def get_df_ads_by_party(df: pd.DataFrame) -> pd.DataFrame:
    """

    This function calculates the facebook ads by page name using the aux "count" column.

    """
    # colors = df['COLORS']
    df_aux_0 = df.groupby(["page_name"]).agg({"Count": np.sum})
    df_aux_0['Colors'] = [
        '#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'
    ]

    return df_aux_0


def get_df_ads_by_spended(df: pd.DataFrame) -> pd.DataFrame:
    """

    """
    def f_parse_currency(x, col):
        currency = x["currency"]
        if currency == "BOB":
            return int(float(x[col]) / 6.96)
        else:
            return x[col]

    #df = df_timed_splited
    df.loc[:, "spend_min_USD"] = df.apply(
        lambda x: f_parse_currency(x, "spend_min"), axis=1)
    df.loc[:, "spend_max_USD"] = df.apply(
        lambda x: f_parse_currency(x, "spend_max"), axis=1)

    df_aux_2 = df.groupby(["page_name"]).agg({"spend_min_USD": np.sum})
    df_aux_2['Count'] = df.groupby(["page_name"]).agg({"Count": np.sum})
    df_aux_2['spend_max_USD'] = df.groupby(["page_name"
                                            ]).agg({"spend_max_USD": np.sum})
    df_aux_2.reset_index(inplace=True)

    return df_aux_2


def get_df_ads_by_funding_entity(df: pd.DataFrame) -> pd.DataFrame:
    """
        This function calculates the facebook ads by page name using the aux "count" column.
    """

    df_aux_1 = df.groupby(["page_name",
                           "funding_entity"]).agg({"Count": np.sum})

    return df_aux_1