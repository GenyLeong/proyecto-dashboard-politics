import os
import pandas as pd
import json
from flask import Flask, render_template, jsonify, request
from helpers import *
app = Flask(__name__)

map_id_to_date = {
    0: datetime(2020, 8, 4, 0, 0, 0),
    1: datetime(2020, 9, 17, 0, 0, 0),
    2: datetime(2020, 10, 14, 0, 0, 0),
    3: datetime(2020, 10, 17, 0, 0, 0),
    4: datetime(2020, 10, 27, 0, 0, 0)
}

F1 = "Arce.csv"
F2 = "Camacho.csv"
F3 = "Carlos_Mesa.csv"
F4 = "ads_library_data.csv"

DATA_FRAME_ADS_LIBRARY = read_fb_ads_lib_data(file_input=F4)

candidates = ["Arce", "Camacho", "Carlos Mesa"]


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/ads-library-data')
def api_ads_library():

    DATA_FRAME = read_fb_data(file_1=F1, file_2=F2, file_3=F3)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)
    df_likes = create_reactions_df(t_start,
                                   t_end,
                                   kind="Likes",
                                   df_input=DATA_FRAME)

    return df_likes.to_json()


@app.route('/ads_expenses')
def update_bolivia_map_camacho():
    """ Callback to rerender Reaction Shares time series """
    global DATA_FRAME_ADS_LIBRARY

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)

    # Create timeseries index
    df_raw_timed = create_timestamp_indexes(DATA_FRAME_ADS_LIBRARY,
                                            column="ad_delivery_start_time",
                                            format_date="%Y-%m-%d")

    # Split the data by  time invervals
    df_timed_splited = create_time_splits(df=df_raw_timed,
                                          t_start=t_start,
                                          t_end=t_end)

    def f_parse_currency(x, col):
        currency = x["currency"]
        if currency == "BOB":
            return float(x[col]) / 6.96
        else:
            return x[col]

    df_timed_splited.loc[:, "spend_min_USD"] = df_timed_splited.apply(
        lambda x: f_parse_currency(x, "spend_min"), axis=1)
    df_timed_splited.loc[:, "spend_max_USD"] = df_timed_splited.apply(
        lambda x: f_parse_currency(x, "spend_max"), axis=1)

    # Calculate
    total_money = round(df_timed_splited["spend_max_USD"].sum(), 2)
    ad_ids = df_timed_splited["ad_id"].to_list()
    total_money = f"{total_money}"

    return jsonify({
        'spend_money': total_money,
        'total_ads': len(ad_ids),
        'political_party': candidates
    })


@app.route('/count_per_candidate')
def update_ads_graph():
    """ Callback to rerender Reaction Shares time series """
    global DATA_FRAME_ADS_LIBRARY

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)

    # Create timeseries index
    df_raw_timed = create_timestamp_indexes(DATA_FRAME_ADS_LIBRARY,
                                            column="ad_delivery_start_time",
                                            format_date="%Y-%m-%d")

    # Split the data by  time invervals
    df_timed_splited = create_time_splits(df=df_raw_timed,
                                          t_start=t_start,
                                          t_end=t_end)

    df_p = get_df_count_ads(df=df_timed_splited)

    # figure = create_ads_timeseries(df_input=df_p)

    # figure["layout"] = {'title': "Ads count per candidate over time"}

    return df_p.to_json()


@app.route('/tree_map_spend')
def update_tree_map_one():
    """ Callback to rerender Reaction Shares time series """
    global DATA_FRAME_ADS_LIBRARY

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)

    # Create timeseries index
    df_raw_timed = create_timestamp_indexes(DATA_FRAME_ADS_LIBRARY,
                                            column="ad_delivery_start_time",
                                            format_date="%Y-%m-%d")

    # Split the data by  time invervals
    df_timed_splited = create_time_splits(df=df_raw_timed,
                                          t_start=t_start,
                                          t_end=t_end)

    df_ads_by_party = get_df_ads_by_party(df=df_timed_splited)

    df_ads_by_party.reset_index(inplace=True)

    # fig = create_tree_map_plot(df=df_ads_by_party,
    #                            values="Count",
    #                            columns=["page_name"],
    #                            title='Total Anuncios por Página de Facebook',
    #                            width=None,
    #                            height=None)

    return df_ads_by_party.to_json()


@app.route('/perfil_expenses')
def update_cc_total_ads():
    """ Callback to rerender Reaction Shares time series """
    global DATA_FRAME_ADS_LIBRARY

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)

    # Calculate
    # Create timeseries index
    df_raw_timed = create_timestamp_indexes(DATA_FRAME_ADS_LIBRARY,
                                            column="ad_delivery_start_time",
                                            format_date="%Y-%m-%d")

    # Split the data by  time invervals
    df_timed_splited = create_time_splits(df=df_raw_timed,
                                          t_start=t_start,
                                          t_end=t_end)

    # Calculate
    df_ads = get_df_ads_by_spended(df=df_timed_splited)

    return df_ads.to_json()


@app.route('/funding_entity')
def update_tree_map_two():
    """ Callback to rerender Reaction Shares time series """
    global DATA_FRAME_ADS_LIBRARY

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    start_arr = [int(x) for x in start_date.split("/")]
    end_arr = [int(x) for x in end_date.split("/")]
    t_start = datetime(start_arr[2], start_arr[1], start_arr[0], 0, 0, 0)
    t_end = datetime(end_arr[2], end_arr[1], end_arr[0], 0, 0, 0)

    # Create timeseries index
    df_raw_timed = create_timestamp_indexes(DATA_FRAME_ADS_LIBRARY,
                                            column="ad_delivery_start_time",
                                            format_date="%Y-%m-%d")

    # Split the data by time invervals
    df_timed_splited = create_time_splits(df=df_raw_timed,
                                          t_start=t_start,
                                          t_end=t_end)

    # Calculate
    df_ads = get_df_ads_by_funding_entity(df=df_timed_splited)

    df_ads.reset_index(inplace=True)

    # fig = create_tree_map_plot(
    #     df=df_ads,
    #     values="Count",
    #     columns=["page_name", "funding_entity"],
    #     title='Total Anuncios por Página de FB y Funding Entity',
    #     width=None,
    #     height=None)

    return df_ads.to_json()
    #return json.loads(total_ads_perfil)


if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv('PORT', 5000)))
