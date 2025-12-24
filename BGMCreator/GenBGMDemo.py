import json
import time

import requests

import Sign

STATUS_CODE_SUCCESS = 0

QUERY_STATUS_CODE_WAITING = 0
QUERY_STATUS_CODE_HANDING = 1
QUERY_STATUS_CODE_SUCCESS = 2
QUERY_STATUS_CODE_FAILED = 3


def get_response(response):
    response_json = json.loads(response.text)
    return response_json.get('Code'), response_json.get('Message'), response_json.get('Result'), response_json.get(
        'ResponseMetadata')


if __name__ == "__main__":
    ak = "xxx"
    sk = "xxx"
    text = "失败结局音乐，阴郁绝望未解之谜，低音弦乐持续颤音，使用不协和音程制造不安，加入风雪声脚步声渐远的音效，整体阴暗压抑，失败感和不甘，极慢或无明显节奏，时长60秒"
    Duration = 60 # 单位：秒，范围：[30,120]

    action = "GenBGM"
    version = "2024-08-12"
    region = "cn-beijing"
    service = 'imagination'
    host = "open.volcengineapi.com"
    path = "/"
    query = {'Action': action,
             'Version': version}
    body = {
        'Text': text,
        'Duration': Duration,
        'Version': 'v5.0',
    }
    x_content_sha256 = Sign.hash_sha256(json.dumps(body))
    headers = {"Content-Type": 'application/json',
               'Host': host,
               'X-Date': Sign.get_x_date(),
               'X-Content-Sha256': x_content_sha256
               }
    authorization = Sign.get_authorization("POST", headers=headers, query=query, service=service, region=region, ak=ak,
                                           sk=sk)
    print(f"===>authorization:{authorization}")

    headers["Authorization"] = authorization

    response = requests.post(Sign.get_url(host, path, action, version), data=json.dumps(body), headers=headers)
    print(f"===>Response:{response.text}")
    # 查询歌曲生成信息
    code, message, result, ResponseMetadata = get_response(response)
    if code != STATUS_CODE_SUCCESS or not response.ok:
        raise RuntimeError(response.text)
    taskId = result['TaskID']
    predictedWaitTime =  5  # 预计等待生成音乐需要的时间，单位：s
    print('===>waiting...')
    time.sleep(predictedWaitTime)
    body = {'TaskID': taskId}
    x_content_sha256 = Sign.hash_sha256(json.dumps(body))
    headers['X-Content-Sha256'] = x_content_sha256
    headers['X-Date'] = Sign.get_x_date()
    action = 'QuerySong'
    query["Action"] = action
    authorization = Sign.get_authorization("POST", headers=headers, query=query, service=service, region=region, ak=ak,
                                           sk=sk)
    print(f"===>authorization:{authorization}")

    headers["Authorization"] = authorization
    songDetail = None
    while True:
        response = requests.post(Sign.get_url(host, path, action, version), data=json.dumps(body), headers=headers)
        print(response.text)
        if not response.ok:
            raise RuntimeError(response.text)

        code, message, result, ResponseMetadata = get_response(response)
        progress = result.get('Progress')
        status = result.get('Status')

        if status == QUERY_STATUS_CODE_FAILED:
            raise RuntimeError(response.text)
        elif status == QUERY_STATUS_CODE_SUCCESS:
            songDetail = result.get('SongDetail')
            print(f"===>query finished:{progress}")
            break
        elif status == QUERY_STATUS_CODE_WAITING or status == QUERY_STATUS_CODE_HANDING:
            print(f"===>Progress:{progress}")
            # 间隔一定时间再查询
            time.sleep(5)
        else:
            print(response.text)
            break

    if songDetail is not None:
        audioUrl = songDetail.get('AudioUrl')
        print(f"===>AudioUrl:{audioUrl}")
